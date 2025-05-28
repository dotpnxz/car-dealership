<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

header('Content-Type: application/json');

// Allow CORS for both local and live domains
$allowed_origins = [
    'http://localhost:5173',
    'https://mjautolove.site'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';
require_once(__DIR__ . '/../config/config.php');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Received input: " . json_encode($data));
    
    if (!isset($data['payment_reference']) || !isset($data['amount'])) {
        throw new Exception('Missing required fields');
    }
    
    $referenceId = $data['payment_reference'];
    if ($referenceId <= 0) {
        throw new Exception('Invalid reference ID');
    }

    $amount = $data['amount'];
    if ($amount <= 0) {
        throw new Exception('Invalid amount');
    }

    require_once __DIR__ . '/db_connect.php';
    $conn = db_connect();
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Check if this is a purchase or reservation
    $checkStmt = $conn->prepare("SELECT 'purchase' as type FROM purchases WHERE id = ? UNION SELECT 'reservation' as type FROM reserved_cars WHERE id = ?");
    $checkStmt->execute([$referenceId, $referenceId]);
    $typeResult = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$typeResult) {
        throw new Exception('Invalid reference ID - not found in purchases or reservations');
    }

    // Generate unique payment reference based on type
    $paymentReference = ($typeResult['type'] === 'purchase' ? 'PUR' : 'RES') . $referenceId . '_' . time();

    $client = new \GuzzleHttp\Client();
    $secretKey = getenv('PAYMONGO_SECRET_KEY');
    $response = $client->post('https://api.paymongo.com/v1/links', [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json',
            'authorization' => 'Basic ' . base64_encode($secretKey),
        ],
        'json' => [
            'data' => [
                'attributes' => [
                    'amount' => (int)($amount * 100),
                    'description' => ($typeResult['type'] === 'purchase' ? "Car Purchase Payment" : "Car Reservation Fee") . " - " . $paymentReference,
                    'metadata' => [
                        'reference_id' => $referenceId,
                        'payment_reference' => $paymentReference,
                        'pm_reference_number' => $paymentReference,
                        'type' => $typeResult['type']
                    ],
                    'external_reference_number' => $referenceId
                ]
            ]
        ]
    ]);

    $paymongoResult = json_decode($response->getBody()->getContents(), true);
    error_log("PayMongo Response: " . json_encode($paymongoResult));

    if (!isset($paymongoResult['data']['attributes']['checkout_url'])) {
        throw new Exception('Invalid response from payment provider');
    }

    // Update the appropriate table based on type
    if ($typeResult['type'] === 'purchase') {
        $stmt = $conn->prepare("
            UPDATE purchases 
            SET payment_reference = ?, 
                payment_status = 'pending',
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
    } else {
        $stmt = $conn->prepare("
            UPDATE reserved_cars 
            SET payment_reference = ?, 
                payment_status = 'pending',
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
    }
    
    if (!$stmt->execute([$paymentReference, $referenceId])) {
        throw new Exception("Failed to update " . $typeResult['type']);
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'payment_url' => $paymongoResult['data']['attributes']['checkout_url'],
            'reference' => $paymongoResult['data']['id'],
            'payment_reference' => $paymentReference
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>