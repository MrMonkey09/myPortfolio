<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, x-api-key");
header("Content-Type: application/json");

// Responder a peticiones OPTIONS (Preflight de CORS) de forma inmediata
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Función simple para parsear el .env local (ideal para hosts compartidos)
function loadEnv($path = '.env') {
    if (!file_exists($path)) {
        return false;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
    return true;
}

// Intentar cargar las variables de entorno
loadEnv();

// Obtener la clave API (ya sea del entorno local o cPanel setea las env vars)
$valid_api_key = getenv('API_KEY') ?: $_ENV['API_KEY'] ?? false;
$notion_token = getenv('NOTION_TOKEN') ?: $_ENV['NOTION_TOKEN'] ?? false;
$notion_db_id = getenv('NOTION_DB_ID') ?: $_ENV['NOTION_DB_ID'] ?? false;

// Validar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Metodo no permitido. Utilice POST."]);
    exit();
}

// Validar API KEY
$headers = apache_request_headers();
$provided_key = isset($headers['x-api-key']) ? $headers['x-api-key'] : (isset($headers['X-Api-Key']) ? $headers['X-Api-Key'] : null);

if (!$valid_api_key || $provided_key !== $valid_api_key) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado. API Key invalida o ausente."]);
    exit();
}

// Obtener payload
$json = file_get_contents('php://input');
$formulario = json_decode($json, true);

if (!$formulario || !isset($formulario['Nombre'])) {
    http_response_code(400);
    echo json_encode(["error" => "Payload invalido."]);
    exit();
}

// Estructurar el cuerpo de la petición para Notion
$notion_payload = [
    "parent" => [
        "database_id" => $notion_db_id
    ],
    "properties" => [
        "Nombre" => [
            "title" => [
                [
                    "type" => "text",
                    "text" => [
                        "content" => $formulario["Nombre"]
                    ]
                ]
            ]
        ],
        "Correo electrónico" => [
            "email" => $formulario["Correo"] ?? ""
        ],
        "Teléfono" => [
            "phone_number" => $formulario["N° de Contacto"] ?? ""
        ],
        "Red Social Preferente" => [
            "url" => !empty($formulario["Red Social Preferente"]) ? $formulario["Red Social Preferente"] : null
        ],
        "Mensaje" => [
            "rich_text" => [
                [
                    "type" => "text",
                    "text" => [
                        "content" => $formulario["Mensaje"] ?? ""
                    ]
                ]
            ]
        ]
    ]
];

// Hacer request a Notion vía cURL
$ch = curl_init("https://api.notion.com/v1/pages");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notion_payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $notion_token,
    "Notion-Version: 2022-06-28",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($http_code >= 200 && $http_code < 300) {
    http_response_code(200);
    echo json_encode(["success" => true, "data" => $formulario]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error de Notion", "notion_response" => json_decode($response), "curl_error" => $curl_error]);
}
?>
