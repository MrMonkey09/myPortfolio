<?php
/**
 * Backend PHP para Cotizador Web - RFC-002 Compliant
 * Endpoints: POST /api/quotes/simulate, POST /api/quotes/lead
 * Compatible con cPanel-first (PHP 7.4+)
 */

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS, GET");
header("Access-Control-Allow-Headers: Content-Type, x-api-key, x-trace-id");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Cargar variables de entorno
function loadEnv($path) {
    if (!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . "=" . trim($value));
    }
    return true;
}

loadEnv(__DIR__ . '/.env');

$apiKey = getenv('API_KEY') ?: ($_ENV['API_KEY'] ?? '');
$notionToken = getenv('NOTION_TOKEN') ?: ($_ENV['NOTION_TOKEN'] ?? '');
$notionDbId = getenv('NOTION_DB_ID') ?: ($_ENV['NOTION_DB_ID'] ?? '');

// ============================================================================
// INICIALIZACIÓN SQLITE (Work-Unit D: Paridad PHP)
// ============================================================================

$sqliteDbPath = __DIR__ . '/data/quotes.sqlite';
$sqlitePdo = null;

function initSqliteDb($dbPath) {
    $dir = dirname($dbPath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create tables if not exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS quotes (
            quote_id TEXT PRIMARY KEY,
            trace_id TEXT NOT NULL UNIQUE,
            schema_version TEXT NOT NULL,
            pricing_config_version TEXT NOT NULL,
            origin TEXT NOT NULL,
            project_type TEXT NOT NULL,
            project_state TEXT NOT NULL,
            currency TEXT NOT NULL,
            input_json TEXT NOT NULL,
            totals_json TEXT NOT NULL,
            meta_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            sync_status TEXT NOT NULL DEFAULT 'pending',
            sync_attempts INTEGER NOT NULL DEFAULT 0,
            sync_last_error TEXT
        )
    ");
    
    return $pdo;
}

function createQuoteRecord($pdo, $record) {
    $stmt = $pdo->prepare("
        INSERT INTO quotes (
            quote_id, trace_id, schema_version, pricing_config_version,
            origin, project_type, project_state, currency,
            input_json, totals_json, meta_json,
            created_at, sync_status, sync_attempts, sync_last_error
        ) VALUES (
            :quote_id, :trace_id, :schema_version, :pricing_config_version,
            :origin, :project_type, :project_state, :currency,
            :input_json, :totals_json, :meta_json,
            :created_at, :sync_status, :sync_attempts, :sync_last_error
        )
    ");
    return $stmt->execute($record);
}

function updateSyncStatus($pdo, $quoteId, $status, $attempts, $error) {
    $stmt = $pdo->prepare("
        UPDATE quotes SET sync_status = ?, sync_attempts = ?, sync_last_error = ?
        WHERE quote_id = ?
    ");
    return $stmt->execute([$status, $attempts, $error, $quoteId]);
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

$pricingConfig = [
    'pricing_config_version' => '2026.05.11',
    'contingency_pct' => 0.12,
    'margin_pct' => 0.25,
    'discount_pct' => 0.0,
    'vat_pct' => 0.19,
    'apply_vat' => true,
];

$disclaimer = 'La cotización final se confirma tras validar requerimientos.';
$originValues = ['quick', 'advanced', 'direct_contact'];
$confidenceValues = ['low', 'medium', 'high'];

// Configuración de reintentos
$retryBackoffMs = [1000, 3000, 7000]; // 1s, 3s, 7s
$idempotencyTtlSeconds = 1800; // 30 minutos
$idempotencyDir = __DIR__ . '/.idempotency';

// ============================================================================
// FUNCIONES HELPERS
// ============================================================================

function makeTraceId() {
    return 'trc_' . str_replace('-', '', bin2hex(random_bytes(16)));
}

function normalizeBool($value, $default = true) {
    if (is_bool($value)) return $value;
    if ($value === 'false' || $value === '0' || $value === 0 || $value === 'no') return false;
    if ($value === 'true' || $value === '1' || $value === 1 || $value === 'yes') return true;
    return $default;
}

function isTransientNotionError($response, $httpCode) {
    // Rate limit
    if ($httpCode === 429) return true;
    // Server errors
    if ($httpCode >= 500 && $httpCode < 600) return true;
    // Connection errors en response
    if (is_array($response)) {
        $code = $response['code'] ?? '';
        if (in_array($code, ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'internal_error'])) return true;
    }
    return false;
}

function sleepMs($ms) {
    usleep($ms * 1000);
}

function ensureIdempotencyDir() {
    global $idempotencyDir;
    if (!is_dir($idempotencyDir)) {
        @mkdir($idempotencyDir, 0755, true);
    }
}

function getIdempotencyKey($traceId, $quoteId) {
    return md5("{$traceId}:lead:{$quoteId}");
}

function checkIdempotency($traceId, $quoteId) {
    global $idempotencyDir, $idempotencyTtlSeconds;
    ensureIdempotencyDir();
    $key = getIdempotencyKey($traceId, $quoteId);
    $file = $idempotencyDir . '/' . $key . '.json';
    if (!file_exists($file)) return null;
    $content = json_decode(file_get_contents($file), true);
    if (!$content) return null;
    // Check TTL
    if (isset($content['expires_at']) && $content['expires_at'] < time()) {
        @unlink($file);
        return null;
    }
    return $content;
}

function setIdempotency($traceId, $quoteId, $status, $response = null) {
    global $idempotencyDir, $idempotencyTtlSeconds;
    ensureIdempotencyDir();
    $key = getIdempotencyKey($traceId, $quoteId);
    $file = $idempotencyDir . '/' . $key . '.json';
    $data = [
        'status' => $status,
        'response' => $response,
        'created_at' => time(),
        'expires_at' => time() + $idempotencyTtlSeconds,
    ];
    @file_put_contents($file, json_encode($data));
}

function sendError($status, $traceId, $type, $code, $message, $details = []) {
    http_response_code($status);
    echo json_encode([
        'error' => [
            'type' => $type,
            'code' => $code,
            'message' => $message,
            'details' => $details,
            'trace_id' => $traceId,
        ]
    ]);
    exit();
}

function toNumber($value, $fallback = 0) {
    $parsed = floatval($value);
    return is_finite($parsed) ? $parsed : $fallback;
}

function normalizeService($value) {
    if (!is_string($value) || trim($value) === '') return 'Otro';
    $raw = strtolower($value);
    if (strpos($raw, 'diseño') !== false || strpos($raw, 'ui') !== false || strpos($raw, 'ux') !== false) return 'Diseño UI/UX';
    if (strpos($raw, 'mantenimiento') !== false) return 'Mantenimiento';
    if (strpos($raw, 'consultor') !== false) return 'Consultoría';
    if (strpos($raw, 'web') !== false || strpos($raw, 'landing') !== false) return 'Desarrollo Web';
    return 'Otro';
}

function sanitizeMessage($value) {
    if (!is_string($value)) return '';
    return preg_replace('/\s+/', ' ', trim($value));
}

// ============================================================================
// VALIDACIÓN PAYLOADS
// ============================================================================

function validateSimulatePayload($payload) {
    $details = [];
    $context = $payload['context'] ?? [];
    $input = $payload['input'] ?? [];
    $lineItems = is_array($input['line_items'] ?? null) ? $input['line_items'] : [];

    // Context campos requeridos
    foreach (['schema_version', 'origin', 'project_type', 'project_state', 'currency'] as $field) {
        if (empty(trim($context[$field] ?? ''))) {
            $details[] = ['field' => "context.{$field}", 'code' => 'REQUIRED', 'message' => "{$field} es obligatorio"];
        }
    }

    // Origin validation
    global $originValues;
    if (!empty($context['origin']) && !in_array($context['origin'], $originValues)) {
        $details[] = ['field' => 'context.origin', 'code' => 'INVALID_ENUM', 'message' => 'origin debe ser quick, advanced o direct_contact'];
    }

    // quick_answers validation
    if (($context['origin'] ?? '') === 'quick') {
        $quickAnswers = $input['quick_answers'] ?? null;
        if (!$quickAnswers || !is_array($quickAnswers)) {
            $details[] = ['field' => 'input.quick_answers', 'code' => 'REQUIRED', 'message' => 'quick_answers es obligatorio'];
        } else {
            foreach (['pages_estimate', 'needs_ecommerce', 'urgency'] as $field) {
                if (empty($quickAnswers[$field])) {
                    $details[] = ['field' => "input.quick_answers.{$field}", 'code' => 'REQUIRED', 'message' => "{$field} obligatorio"];
                }
            }
        }
    }

    // line_items validation
    foreach ($lineItems as $idx => $item) {
        if (($item['include'] ?? '') === 'yes') {
            if (empty($item['quantity']) || $item['quantity'] <= 0) {
                $details[] = ['field' => "input.line_items[{$idx}].quantity", 'code' => 'INVALID_QUANTITY', 'message' => 'quantity debe ser mayor a 0'];
            }
            if (empty(trim($item['complexity'] ?? ''))) {
                $details[] = ['field' => "input.line_items[{$idx}].complexity", 'code' => 'LINE_ITEM_COMPLEXITY_REQUIRED', 'message' => 'complexity obligatoria'];
            }
        }
    }

    // Pricing validation (porcentajes 0..1)
    $pricing = [
        'contingency_pct' => floatval($input['pricing']['contingency_pct'] ?? $payload['pricing_snapshot']['contingency_pct'] ?? 0.12),
        'margin_pct' => floatval($input['pricing']['margin_pct'] ?? $payload['pricing_snapshot']['margin_pct'] ?? 0.25),
        'discount_pct' => floatval($input['pricing']['discount_pct'] ?? $payload['pricing_snapshot']['discount_pct'] ?? 0),
        'vat_pct' => floatval($input['pricing']['vat_pct'] ?? $payload['pricing_snapshot']['vat_pct'] ?? 0.19),
    ];

    foreach ($pricing as $field => $value) {
        if ($value < 0 || $value > 1) {
            $details[] = ['field' => "pricing.{$field}", 'code' => 'OUT_OF_RANGE', 'message' => "{$field} debe estar entre 0 y 1"];
        }
    }

    return ['details' => $details, 'lineItems' => $lineItems, 'pricing' => $pricing];
}

function validateLeadPayload($payload) {
    $details = [];
    $contact = $payload['contact'] ?? [];
    $quoteRef = $payload['quote_ref'] ?? [];
    global $originValues;

    // Contact validation
    if (empty(trim($contact['name'] ?? ''))) {
        $details[] = ['field' => 'contact.name', 'code' => 'REQUIRED', 'message' => 'name obligatorio'];
    }
    if (empty(trim($contact['email'] ?? ''))) {
        $details[] = ['field' => 'contact.email', 'code' => 'REQUIRED', 'message' => 'email obligatorio'];
    } elseif (!filter_var(trim($contact['email']), FILTER_VALIDATE_EMAIL)) {
        $details[] = ['field' => 'contact.email', 'code' => 'INVALID_EMAIL', 'message' => 'email no válido'];
    }

    // quote_ref validation
    if (empty(trim($quoteRef['quote_id'] ?? ''))) {
        $details[] = ['field' => 'quote_ref.quote_id', 'code' => 'REQUIRED', 'message' => 'quote_id obligatorio'];
    }
    if (empty(trim($quoteRef['origin'] ?? ''))) {
        $details[] = ['field' => 'quote_ref.origin', 'code' => 'REQUIRED', 'message' => 'origin obligatorio'];
    } elseif (!in_array($quoteRef['origin'], $originValues)) {
        $details[] = ['field' => 'quote_ref.origin', 'code' => 'INVALID_ENUM', 'message' => 'origin debe ser quick/advanced/direct_contact'];
    }
    if (!isset($quoteRef['total_project']) || $quoteRef['total_project'] < 0) {
        $details[] = ['field' => 'quote_ref.total_project', 'code' => 'OUT_OF_RANGE', 'message' => 'total_project >= 0'];
    }
    if (!isset($quoteRef['total_monthly']) || $quoteRef['total_monthly'] < 0) {
        $details[] = ['field' => 'quote_ref.total_monthly', 'code' => 'OUT_OF_RANGE', 'message' => 'total_monthly >= 0'];
    }

    return [
        'details' => $details,
        'sanitized' => [
            'contact' => [
                'name' => trim($contact['name'] ?? ''),
                'email' => strtolower(trim($contact['email'] ?? '')),
                'phone' => trim($contact['phone'] ?? ''),
                'preferred_channel' => strtolower(trim($contact['preferred_channel'] ?? '')),
            ],
            'quote_ref' => [
                'quote_id' => trim($quoteRef['quote_id'] ?? ''),
                'origin' => trim($quoteRef['origin'] ?? ''),
                'total_project' => floatval($quoteRef['total_project'] ?? 0),
                'total_monthly' => floatval($quoteRef['total_monthly'] ?? 0),
            ],
            'message' => sanitizeMessage($payload['message'] ?? ''),
        ]
    ];
}

// ============================================================================
// BUILD TOTALS - RFC-002 + RFC-004 Patch
// ============================================================================

function buildTotals($lineItems, $pricing, $applyVat, $monthlyServices = []) {
    $directCost = 0;
    foreach ($lineItems as $item) {
        if (($item['include'] ?? '') === 'yes') {
            $unitCost = toNumber($item['base_cost'] ?? null, toNumber($item['unit_hours'] ?? 0) * 18000);
            $directCost += $unitCost * toNumber($item['quantity'] ?? 0);
        }
    }

    $contingencyValue = $directCost * $pricing['contingency_pct'];
    $subtotalWithContingency = $directCost + $contingencyValue;
    $marginValue = $subtotalWithContingency * $pricing['margin_pct'];
    $subtotalNet = $subtotalWithContingency + $marginValue;
    $discountValue = $subtotalNet * $pricing['discount_pct'];
    $totalNet = $subtotalNet - $discountValue;
    $vatValue = $applyVat ? $totalNet * $pricing['vat_pct'] : 0;
    $totalProject = $totalNet + $vatValue;

    // Calcular total_monthly desde servicios mensuales con include="yes"
    $totalMonthly = 0;
    foreach ($monthlyServices as $s) {
        if (($s['include'] ?? '') === 'yes') {
            $totalMonthly += toNumber($s['monthly_value'] ?? 0);
        }
    }

    // RFC-004: estimated range
    $estimatedMin = $totalProject * 0.9;
    $estimatedMax = $totalProject * 1.15;

    return [
        'direct_cost' => round($directCost),
        'contingency_value' => round($contingencyValue),
        'subtotal_with_contingency' => round($subtotalWithContingency),
        'margin_value' => round($marginValue),
        'subtotal_net' => round($subtotalNet),
        'discount_value' => round($discountValue),
        'total_net' => round($totalNet),
        'vat_value' => round($vatValue),
        'total_project' => round($totalProject),
        'total_monthly' => round($totalMonthly),
        'estimated_min' => round($estimatedMin),
        'estimated_max' => round($estimatedMax),
    ];
}

// ============================================================================
// PERSISTENCIA NOTION CON REINTENTOS
// ============================================================================

function persistLeadToNotion($token, $dbId, $leadId, $traceId, $payload) {
    global $retryBackoffMs;

    $createdAt = gmdate('Y-m-d\TH:i:s\Z');
    $title = "Lead {$leadId} | " . ($payload['quote_ref']['quote_id'] ?? 'unknown');

    $notionPayload = [
        'parent' => ['database_id' => $dbId],
        'properties' => [
            'Name' => ['title' => [['text' => ['content' => substr($title, 0, 2000)]]]]
        ],
        'children' => []
    ];

    // Agregar contenido como bloques
    $content = json_encode(array_merge([
        'lead_id' => $leadId,
        'trace_id' => $traceId,
        'created_at' => $createdAt,
        'schema_version' => $payload['schema_version'] ?? '1.0.0',
        'pricing_config_version' => $payload['pricing_config_version'] ?? '2026.05.11',
    ], $payload), JSON_PRETTY_PRINT);

    $chunks = str_split($content, 1900);
    foreach ($chunks as $chunk) {
        $notionPayload['children'][] = [
            'object' => 'block',
            'type' => 'paragraph',
            'paragraph' => ['rich_text' => [['type' => 'text', 'text' => ['content' => $chunk]]]]
        ];
    }

    $lastError = null;
    $lastHttpCode = 0;

    foreach ($retryBackoffMs as $attempt => $backoffMs) {
        $ch = curl_init("https://api.notion.com/v1/pages");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notionPayload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            "Notion-Version: 2022-06-28",
            "Content-Type: application/json"
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return $response; // Success
        }

        $lastError = $response;
        $lastHttpCode = $httpCode;

        // Check if transient error - retry
        if (isTransientNotionError($response, $httpCode) && $attempt < count($retryBackoffMs) - 1) {
            sleepMs($backoffMs);
            continue;
        }

        // Non-retryable error - break
        break;
    }

    // Return last response (will be handled as error by caller)
    return $lastError;
}

// ============================================================================
// SYNC BACKGROUND - Work-Unit D: Paridad PHP
// ============================================================================

function syncQuoteToNotionBackground($record) {
    global $notionToken, $notionDbId;
    
    if (empty($notionToken) || empty($notionDbId)) {
        return;
    }
    
    $retryBackoffMs = [1000, 3000, 7000];
    $maxRetries = 3;
    
    for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
        $ch = curl_init("https://api.notion.com/v1/pages");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        
        $totals = json_decode($record[':totals_json'], true);
        $payload = [
            'parent' => ['database_id' => $notionDbId],
            'properties' => [
                'Name' => ['title' => [['text' => ['content' => 'Quote ' . $record[':quote_id']]]]]
            ],
            'children' => [
                [
                    'object' => 'block',
                    'type' => 'paragraph',
                    'paragraph' => ['rich_text' => [['type' => 'text', 'text' => ['content' => json_encode([
                        'quote_id' => $record[':quote_id'],
                        'trace_id' => $record[':trace_id'],
                        'total_project' => $totals['total_project'] ?? 0,
                        'total_monthly' => $totals['total_monthly'] ?? 0,
                    ], JSON_PRETTY_PRINT)]]]]]
            ]
        ];
        
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer $notionToken",
            "Notion-Version: 2022-06-28",
            "Content-Type: application/json"
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return; // Success
        }
        
        // Transient error - retry
        if (($httpCode === 429 || $httpCode >= 500) && $attempt < $maxRetries - 1) {
            usleep($retryBackoffMs[$attempt] * 1000);
            continue;
        }
        
        // Permanent error or max retries - log and exit
        break;
    }
}

// ============================================================================
// AUTH CHECK
// ============================================================================

function checkApiKey($validKey) {
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }
    $providedKey = $headers['x-api-key'] ?? $headers['X-Api-Key'] ?? null;
    if ($providedKey !== $validKey) {
        sendError(401, makeTraceId(), 'validation_error', 'UNAUTHORIZED', 'API Key inválida');
    }
}

// ============================================================================
// ROUTER
// ============================================================================

$path = $_SERVER['PATH_INFO'] ?? '/';

// Health check
if ($path === '/health' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['ok' => true, 'service' => 'quotes-api-php']);
    exit();
}

// API routes require auth
if (strpos($path, '/api/') === 0) {
    if (empty($apiKey)) {
        sendError(500, makeTraceId(), 'internal_error', 'CONFIG_MISSING', 'API_KEY no configurada');
    }
    checkApiKey($apiKey);
}

// POST /api/quotes/simulate
if ($path === '/api/quotes/simulate' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $traceId = makeTraceId();
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];

    $validation = validateSimulatePayload($payload);
    if (!empty($validation['details'])) {
        sendError(400, $traceId, 'validation_error', 'INVALID_REQUEST', 'Hay campos inválidos', $validation['details']);
    }

    // Normalize apply_vat to boolean (fix for string "false" being truthy in PHP)
    $applyVatInput = $payload['input']['apply_vat'] ?? $pricingConfig['apply_vat'];
    $applyVat = normalizeBool($applyVatInput, $pricingConfig['apply_vat']);
    $totals = buildTotals(
        $validation['lineItems'],
        $pricing,
        $applyVat,
        $input['monthly_services'] ?? []
    );

    // Domain validations
    if ($applyVat === false && $totals['vat_value'] !== 0) {
        sendError(422, $traceId, 'domain_error', 'VAT_CONFIGURATION_INVALID', 'apply_vat=false implica vat_value=0');
    }
    if ($totals['total_project'] < 0) {
        sendError(422, $traceId, 'domain_error', 'TOTAL_PROJECT_INVALID', 'total_project no puede ser negativo');
    }

    global $confidenceValues;
    $origin = $payload['context']['origin'] ?? 'quick';
    $confidenceLevel = ($origin === 'advanced') ? 'high' : 'medium';

    $response = [
        'quote' => [
            'quote_id' => 'qt_' . str_replace('-', '', bin2hex(random_bytes(12))),
            'status' => 'simulated',
            'created_at' => gmdate('Y-m-d\TH:i:s\Z'),
            'confidence_level' => $confidenceLevel,
            'disclaimer' => $disclaimer,
        ],
        'totals' => array_merge($totals, ['confidence_level' => $confidenceLevel, 'disclaimer' => $disclaimer]),
        'breakdown' => $validation['lineItems'],
        'meta' => [
            'schema_version' => $payload['context']['schema_version'] ?? '1.0.0',
            'pricing_config_version' => $pricingConfig['pricing_config_version'],
            'trace_id' => $traceId,
        ]
    ];

    // Construir record para SQLite (Work-Unit D: Paridad PHP)
    $record = [
        ':quote_id' => $response['quote']['quote_id'],
        ':trace_id' => $traceId,
        ':schema_version' => $payload['context']['schema_version'] ?? '1.0.0',
        ':pricing_config_version' => $pricingConfig['pricing_config_version'],
        ':origin' => $payload['context']['origin'] ?? 'quick',
        ':project_type' => $payload['context']['project_type'] ?? '',
        ':project_state' => $payload['context']['project_state'] ?? '',
        ':currency' => $payload['context']['currency'] ?? 'CLP',
        ':input_json' => json_encode([
            'line_items' => $validation['lineItems'],
            'pricing' => $validation['pricing'],
        ]),
        ':totals_json' => json_encode($totals),
        ':meta_json' => json_encode([
            'schema_version' => $payload['context']['schema_version'] ?? '1.0.0',
            'pricing_config_version' => $pricingConfig['pricing_config_version'],
            'trace_id' => $traceId,
        ]),
        ':created_at' => gmdate('Y-m-d\TH:i:s\Z'),
        ':sync_status' => 'pending',
        ':sync_attempts' => 0,
        ':sync_last_error' => null,
    ];

    // Persistir en SQLite (non-blocking)
    try {
        if (!$sqlitePdo) {
            $sqlitePdo = initSqliteDb($sqliteDbPath);
        }
        createQuoteRecord($sqlitePdo, $record);
    } catch (Exception $e) {
        // Log error but don't block response
        error_log("SQLite persistence error: " . $e->getMessage());
    }

    // Sync async a Notion via register_shutdown_function
    // PHP ejecuta la función al final del request, pasando $record como argumento
    register_shutdown_function(function() use ($record) { syncQuoteToNotionBackground($record); });

    echo json_encode($response);
    exit();
}

// POST /api/quotes/lead
if ($path === '/api/quotes/lead' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $traceId = $_SERVER['HTTP_X_TRACE_ID'] ?? makeTraceId();

    if (empty($notionToken) || empty($notionDbId)) {
        sendError(503, $traceId, 'internal_error', 'NOTION_NOT_CONFIGURED', 'Notion no configurado');
    }

    $payload = json_decode(file_get_contents('php://input'), true) ?? [];
    $validation = validateLeadPayload($payload);

    if (!empty($validation['details'])) {
        sendError(400, $traceId, 'validation_error', 'INVALID_REQUEST', 'Hay campos inválidos', $validation['details']);
    }

    // Idempotency check
    $quoteId = $validation['sanitized']['quote_ref']['quote_id'];
    $existingEntry = checkIdempotency($traceId, $quoteId);

    if ($existingEntry) {
        if ($existingEntry['status'] === 'done') {
            // Return cached response
            http_response_code(200);
            echo json_encode($existingEntry['response']);
            exit();
        } elseif ($existingEntry['status'] === 'in_progress') {
            sendError(409, $traceId, 'conflict_error', 'LEAD_IN_PROGRESS', 'Ya existe una operación en curso para esta clave de idempotencia');
        }
    }

    // Mark as in progress
    setIdempotency($traceId, $quoteId, 'in_progress');

    $leadId = 'ld_' . str_replace('-', '', bin2hex(random_bytes(12)));
    $persistencePayload = array_merge($validation['sanitized'], [
        'schema_version' => $payload['schema_version'] ?? '1.0.0',
        'pricing_config_version' => $payload['pricing_config_version'] ?? $pricingConfig['pricing_config_version'],
    ]);

    try {
        $response = persistLeadToNotion($notionToken, $notionDbId, $leadId, $traceId, $persistencePayload);
        $data = json_decode($response, true);

        if (empty($data['id'])) {
            setIdempotency($traceId, $quoteId, 'failed');
            // Check if transient error (rate limit 429 o similar)
            if (isset($data['code']) && ($data['code'] === 'rate_limited' || strpos($response, '429') !== false)) {
                sendError(409, $traceId, 'conflict_error', 'NOTION_TRANSIENT_FAILURE', 'No se pudo persistir el lead en Notion por una falla transitoria. Reintentá en unos segundos.');
            }
            sendError(500, $traceId, 'internal_error', 'NOTION_PERSISTENCE_FAILED', 'No se pudo persistir el lead');
        }

        // Success - cache response
        $successResponse = [
            'lead_id' => $leadId,
            'status' => 'created',
            'crm_sync' => 'queued',
            'meta' => [
                'trace_id' => $traceId,
                'schema_version' => $persistencePayload['schema_version'],
                'pricing_config_version' => $persistencePayload['pricing_config_version'],
            ]
        ];
        setIdempotency($traceId, $quoteId, 'done', $successResponse);

        http_response_code(201);
        echo json_encode($successResponse);
        exit();

    } catch (Exception $e) {
        setIdempotency($traceId, $quoteId, 'failed');
        sendError(500, $traceId, 'internal_error', 'NOTION_PERSISTENCE_FAILED', 'No se pudo persistir el lead: ' . $e->getMessage());
    }
}

// Legacy endpoint: POST / (backwards compatible)
if (($_SERVER['REQUEST_METHOD'] === 'POST') && ($path === '/' || $path === '')) {
    if (empty($notionToken) || empty($notionDbId)) {
        sendError(500, makeTraceId(), 'internal_error', 'CONFIG_MISSING', 'Configuración incompleta');
    }

    $formulario = json_decode(file_get_contents('php://input'), true);
    if (!is_array($formulario) || empty(trim($formulario['Nombre'] ?? ''))) {
        sendError(400, makeTraceId(), 'validation_error', 'INVALID_PAYLOAD', 'Payload inválido');
    }

    $serviceName = normalizeService($formulario['Servicio de interés'] ?? '');

    $notionPayload = [
        'parent' => ['database_id' => $notionDbId],
        'properties' => [
            'Name' => ['title' => [['text' => ['content' => $formulario['Nombre'] ?? '']]]],
            'Correo electrónico' => ['email' => $formulario['Correo'] ?? ''],
            'Teléfono' => ['phone_number' => $formulario['N° de Contacto'] ?? ''],
            'Red Social Preferente' => ['url' => $formulario['Red Social Preferente'] ?? null],
            'Mensaje' => ['rich_text' => [['text' => ['content' => $formulario['Mensaje'] ?? '']]]],
            'Servicio de interés' => ['select' => ['name' => $serviceName]],
        ]
    ];

    $ch = curl_init("https://api.notion.com/v1/pages");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notionPayload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$notionToken}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode(['success' => true, 'data' => $formulario]);
        exit();
    }

    sendError(500, makeTraceId(), 'internal_error', 'NOTION_ERROR', 'Error al guardar en Notion');
}

// 404
sendError(404, makeTraceId(), 'validation_error', 'ROUTE_NOT_FOUND', 'Ruta no encontrada: ' . $_SERVER['REQUEST_METHOD'] . ' ' . $path);
?>