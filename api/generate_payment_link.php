<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . '/../config/config.php');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['amount']) || !isset($data['reservation_id'])) {
        throw new Exception('Missing required fields');
    }

    require_once(__DIR__ . '/../vendor/autoload.php');
    
    $client = new \GuzzleHttp\Client();
    $secretKey = getenv('PAYMONGO_SECRET_KEY');
    
    // Format amount for PayMongo (needs to be in smallest currency unit)
    $amount = (int)($data['amount'] * 100); // Convert to integer for PayMongo
    
    $description = "Reservation #{$data['reservation_id']} Payment";
    
    $apiResponse = $client->request('POST', 'https://api.paymongo.com/v1/links', [
        'body' => json_encode([
            'data' => [
                'attributes' => [
                    'amount' => $amount, // Now passing integer instead of formatted string
                    'description' => $description,
                    'remarks' => "Reservation #{$data['reservation_id']}"
                ]
            ]
        ]),
        'headers' => [
            'accept' => 'application/json',
            'authorization' => 'Basic ' . base64_encode($secretKey),
            'content-type' => 'application/json',
        ],
    ]);
    
    $paymongoResponse = json_decode($apiResponse->getBody(), true);
    
    if (!isset($paymongoResponse['data']['attributes']['checkout_url'])) {
        throw new Exception('Invalid response from payment provider');
    }
    
    $response = [
        'success' => true,
        'data' => [
            'payment_url' => $paymongoResponse['data']['attributes']['checkout_url'],
            'reference' => $paymongoResponse['data']['id']
        ]
    ];

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}