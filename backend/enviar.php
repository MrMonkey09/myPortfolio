<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, x-api-key");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function loadEnv($path = '.env') {
    if (!file_exists($path)) {
        return false;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        putenv("{$name}={$value}");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }

    return true;
}

function getRequestHeadersSafe() {
    if (function_exists('getallheaders')) {
        return getallheaders();
    }
    if (function_exists('apache_request_headers')) {
        return apache_request_headers();
    }
    return [];
}

function normalizeService($value) {
    if (!is_string($value) || trim($value) === '') {
        return 'Otro';
    }

    $raw = strtolower($value);

    if (strpos($raw, 'diseño') !== false || strpos($raw, 'ui') !== false || strpos($raw, 'ux') !== false) {
        return 'Diseño UI/UX';
    }
    if (strpos($raw, 'mantenimiento') !== false) {
        return 'Mantenimiento';
    }
    if (strpos($raw, 'consultor') !== false) {
        return 'Consultoría';
    }
    if (strpos($raw, 'web') !== false || strpos($raw, 'landing') !== false) {
        return 'Desarrollo Web';
    }

    return 'Otro';
}

loadEnv(__DIR__ . '/.env');

$validApiKey = getenv('API_KEY') ?: ($_ENV['API_KEY'] ?? '');
$notionToken = getenv('NOTION_TOKEN') ?: ($_ENV['NOTION_TOKEN'] ?? '');
$notionDbId = getenv('NOTION_DB_ID') ?: ($_ENV['NOTION_DB_ID'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido. Utilice POST."]);
    exit();
}

if ($validApiKey === '' || $notionToken === '' || $notionDbId === '') {
    http_response_code(500);
    echo json_encode(["error" => "Configuración del backend incompleta."]);
    exit();
}

$headers = getRequestHeadersSafe();
$providedKey = $headers['x-api-key'] ?? ($headers['X-Api-Key'] ?? null);

if ($providedKey !== $validApiKey) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado. API Key inválida o ausente."]);
    exit();
}

$json = file_get_contents('php://input');
$formulario = json_decode($json, true);

if (!is_array($formulario) || !isset($formulario['Nombre']) || trim((string)$formulario['Nombre']) === '') {
    http_response_code(400);
    echo json_encode(["error" => "Payload inválido."]);
    exit();
}

$serviceName = normalizeService($formulario['Servicio de interés'] ?? '');

$notionPayload = [
    "parent" => [
        "type" => "database_id",
        "database_id" => $notionDbId,
    ],
    "properties" => [
        "Nombre" => [
            "title" => [[
                "type" => "text",
                "text" => [
                    "content" => (string)$formulario["Nombre"],
                ],
            ]],
        ],
        "Correo electrónico" => [
            "email" => isset($formulario["Correo"]) ? (string)$formulario["Correo"] : "",
        ],
        "Teléfono" => [
            "phone_number" => isset($formulario["N° de Contacto"]) ? (string)$formulario["N° de Contacto"] : "",
        ],
        "Red Social Preferente" => [
            "url" => !empty($formulario["Red Social Preferente"]) ? (string)$formulario["Red Social Preferente"] : null,
        ],
        "Mensaje" => [
            "rich_text" => [[
                "type" => "text",
                "text" => [
                    "content" => isset($formulario["Mensaje"]) ? (string)$formulario["Mensaje"] : "",
                ],
            ]],
        ],
        "Servicio de interés" => [
            "select" => [
                "name" => $serviceName,
            ],
        ],
    ],
];

$ch = curl_init("https://api.notion.com/v1/pages");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notionPayload, JSON_UNESCAPED_UNICODE));
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$notionToken}",
    "Notion-Version: 2022-06-28",
    "Content-Type: application/json",
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode(["success" => true, "data" => $formulario]);
    exit();
}

http_response_code(500);
echo json_encode([
    "error" => "Error al guardar en Notion.",
    "http_code" => $httpCode,
    "curl_error" => $curlError,
    "notion_response" => json_decode($response, true),
]);
?>
