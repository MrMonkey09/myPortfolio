<?php
/**
 * Backend PHP para Cotizador Web - RFC-002 Compliant
 * Endpoints: POST /api/quotes/simulate, POST /api/quotes/contact
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
            contact_json TEXT,
            meta_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            sync_status TEXT NOT NULL DEFAULT 'pending',
            sync_attempts INTEGER NOT NULL DEFAULT 0,
            sync_last_error TEXT
        )
    ");
    
    // Schema evolution: ensure contact_json exists (Work-Unit D Patch)
    try {
        $pdo->exec("ALTER TABLE quotes ADD COLUMN contact_json TEXT");
    } catch (Exception $e) {
        // Column might already exist, ignore
    }
    
    // Create leads table for contact persistence
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS leads (
            lead_id TEXT PRIMARY KEY,
            quote_id TEXT,
            trace_id TEXT NOT NULL,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            telefono TEXT,
            red_social TEXT,
            mensaje TEXT,
            servicio TEXT,
            created_at TEXT NOT NULL
        )
    ");
    
    return $pdo;
}

function createQuoteRecord($pdo, $record) {
    $stmt = $pdo->prepare("
        INSERT INTO quotes (
            quote_id, trace_id, schema_version, pricing_config_version,
            origin, project_type, project_state, currency,
            input_json, totals_json, contact_json, meta_json,
            created_at, sync_status, sync_attempts, sync_last_error
        ) VALUES (
            :quote_id, :trace_id, :schema_version, :pricing_config_version,
            :origin, :project_type, :project_state, :currency,
            :input_json, :totals_json, :contact_json, :meta_json,
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

function createLeadRecord($pdo, $record) {
    $stmt = $pdo->prepare("
        INSERT INTO leads (lead_id, quote_id, trace_id, nombre, email, telefono, red_social, mensaje, servicio, created_at)
        VALUES (:lead_id, :quote_id, :trace_id, :nombre, :email, :telefono, :red_social, :mensaje, :servicio, :created_at)
    ");
    return $stmt->execute($record);
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
        $validation['pricing'],
        $applyVat,
        $payload['input']['monthly_services'] ?? []
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

    // Extraer contacto si viene en el payload (Work-Unit D Patch)
    $contact = $payload['contact'] ?? null;

    // Construir record para SQLite
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
        ':contact_json' => $contact ? json_encode($contact) : null,
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
        error_log("SQLite persistence error: " . $e->getMessage());
    }

    // Si hay datos de contacto, persistir también como lead en SQLite
    if ($contact) {
        $leadRecord = [
            ':lead_id' => 'ld_' . bin2hex(random_bytes(12)),
            ':quote_id' => $response['quote']['quote_id'],
            ':trace_id' => $traceId,
            ':nombre' => trim($contact['nombre'] ?? $payload['contact']['nombre'] ?? ''),
            ':email' => strtolower(trim($contact['email'] ?? $payload['contact']['email'] ?? '')),
            ':telefono' => trim($contact['telefono'] ?? $payload['contact']['telefono'] ?? ''),
            ':red_social' => trim($contact['red_social'] ?? $payload['contact']['red_social'] ?? ''),
            ':mensaje' => trim($contact['mensaje'] ?? $payload['contact']['mensaje'] ?? ''),
            ':servicio' => trim($contact['servicio'] ?? $payload['contact']['servicio'] ?? ''),
            ':created_at' => gmdate('Y-m-d\TH:i:s\Z'),
        ];
        try {
            createLeadRecord($sqlitePdo, $leadRecord);
        } catch (Exception $e) {
            error_log("SQLite lead persistence error: " . $e->getMessage());
        }
    }

    echo json_encode($response);
    exit();
}

// POST /api/quotes/contact
if ($path === '/api/quotes/contact' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $traceId = makeTraceId();
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];

    $contact = $payload['contact'] ?? [];
    if (empty(trim($contact['nombre'] ?? '')) || empty(trim($contact['email'] ?? ''))) {
        sendError(400, $traceId, 'validation_error', 'REQUIRED_FIELDS', 'nombre y email son obligatorios');
    }

    $leadId = 'ld_' . bin2hex(random_bytes(12));
    $record = [
        ':lead_id' => $leadId,
        ':quote_id' => $payload['quote_ref']['quote_id'] ?? '',
        ':trace_id' => $traceId,
        ':nombre' => trim($contact['nombre']),
        ':email' => strtolower(trim($contact['email'])),
        ':telefono' => trim($contact['telefono'] ?? ''),
        ':red_social' => trim($contact['red_social'] ?? ''),
        ':mensaje' => trim($contact['mensaje'] ?? ''),
        ':servicio' => trim($contact['servicio'] ?? ''),
        ':created_at' => gmdate('Y-m-d\TH:i:s\Z'),
    ];

    try {
        if (!$sqlitePdo) {
            $sqlitePdo = initSqliteDb($sqliteDbPath);
        }
        createLeadRecord($sqlitePdo, $record);
    } catch (Exception $e) {
        sendError(500, $traceId, 'internal_error', 'DB_ERROR', 'Error al guardar el lead: ' . $e->getMessage());
    }

    echo json_encode([
        'lead_id' => $leadId,
        'status' => 'created',
        'meta' => ['trace_id' => $traceId]
    ]);
    exit();
}

// 404
sendError(404, makeTraceId(), 'validation_error', 'ROUTE_NOT_FOUND', 'Ruta no encontrada: ' . $_SERVER['REQUEST_METHOD'] . ' ' . $path);
?>