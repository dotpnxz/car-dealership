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

try {    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Received input: " . json_encode($data));
    
    if (!isset($data['payment_reference']) || !isset($data['amount'])) {
        throw new Exception('Missing required fields');
    }
    
    $reservationId = $data['payment_reference'];
    if ($reservationId <= 0) {
        throw new Exception('Invalid reservation ID');
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

    // Generate unique payment reference
    $paymentReference = 'RES' . $reservationId . '_' . time();    $client = new \GuzzleHttp\Client();
    $secretKey = getenv('PAYMONGO_SECRET_KEY');
    $response = $client->post('https://api.paymongo.com/v1/links', [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json',
            'authorization' => 'Basic ' . base64_encode($secretKey),
        ],
        'json' => [
            'data' => [
                'attributes' => [                    'amount' => (int)($amount * 100),
                    'description' => "Car Reservation Fee - " . $paymentReference,
                    'metadata' => [
                        'reservation_id' => $reservationId,
                        'payment_reference' => $paymentReference,
                        'pm_reference_number' => $paymentReference
                    ],
                    'external_reference_number' => $reservationId
                ]
            ]
        ]
    ]);
      $result = json_decode($response->getBody()->getContents(), true);
    error_log("PayMongo Response: " . json_encode($result));

    if (!isset($result['data']['attributes']['checkout_url'])) {
        throw new Exception('Invalid response from payment provider');
    }

    // Update reservation with payment reference
    $stmt = $conn->prepare("
        UPDATE reserved_cars 
        SET payment_reference = ?, 
            payment_status = 'pending',
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    
    if (!$stmt->execute([$paymentReference, $reservationId])) {
        throw new Exception("Failed to update reservation");
    }    echo json_encode([
        'success' => true,
        'data' => [
            'payment_url' => $result['data']['attributes']['checkout_url'],
            'reference' => $result['data']['id'],
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