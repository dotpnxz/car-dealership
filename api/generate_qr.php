<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';
require_once(__DIR__ . '/../config/config.php');
require_once(__DIR__ . '/../api/db_connect.php');

try {    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Received input: " . json_encode($data));
    
    if (!isset($data['amount']) || !isset($data['reservation_id'])) {
        throw new Exception('Missing required fields');
    }    $conn = db_connect();
    if (!$conn) {
        throw new Exception("Database connection failed");
    }    $client = new \GuzzleHttp\Client();
    $secretKey = getenv('PAYMONGO_SECRET_KEY');
    
    if (!$secretKey) {
        error_log("PayMongo secret key not found in environment");
        throw new Exception('Payment configuration error');
    }
    
    error_log("Using PayMongo key (first 4 chars): " . substr($secretKey, 0, 4));
    
    $requestData = [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json',
            'authorization' => 'Basic ' . base64_encode($secretKey)
        ],
        'json' => [
            'data' => [
                'attributes' => [
                    'kind' => 'instore',
                    'amount' => (int)($data['amount'] * 100),
                    'description' => "Car Reservation Payment",
                    'notes' => "Reservation ID: " . $data['reservation_id'],
                    'mobile_number' => '+639163768107'
                ]
            ]
        ]
    ];

    error_log("PayMongo Request: " . json_encode($requestData));    try {
        $response = $client->request('POST', 'https://api.paymongo.com/v1/qrph/generate', $requestData);
        $responseBody = $response->getBody()->getContents();
        error_log("PayMongo Raw Response: " . $responseBody);
    } catch (\GuzzleHttp\Exception\RequestException $e) {
        error_log("PayMongo API Error: " . $e->getMessage());
        if ($e->hasResponse()) {
            error_log("PayMongo Error Response: " . $e->getResponse()->getBody());
        }
        throw new Exception("Payment gateway error: " . $e->getMessage());
    }
    
    $responseData = json_decode($responseBody);
    if (!$responseData || !isset($responseData->data)) {
        throw new Exception('Invalid response from payment gateway');
    }
      // Update the database with payment reference
    $stmt = $conn->prepare("
        UPDATE reserved_cars 
        SET payment_reference = ?,
            payment_status = 'pending',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
      if (!$stmt->execute([$responseData->data->id, $data['reservation_id']])) {
        throw new Exception("Failed to update reservation");
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'data' => [
            'qr_string' => $responseData->data->attributes->qr_string ?? null,
            'qr_image' => $responseData->data->attributes->qr_image ?? null,
            'amount' => $data['amount'],
            'reference' => $responseData->data->id
        ]
    ]);

} catch (Exception $e) {
    error_log("Error in generate_qr.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>