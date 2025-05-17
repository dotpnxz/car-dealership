<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    if (!$data || !isset($data->amount)) {
        throw new Exception('Invalid request data');
    }

    $client = new \GuzzleHttp\Client();
    
    $requestData = [
        'body' => json_encode([
            'data' => [
                'attributes' => [
                    'kind' => 'instore',
                    'amount' => (int)($data->amount * 100),
                    'description' => "Car Reservation Payment",
                    'notes' => "Reservation ID: " . ($data->reservation_id ?? 'N/A'),
                    'mobile_number' => '+639163768107'  // Replace with your GCash merchant number
                ]
            ]
        ]),
        'headers' => [
            'Content-Type' => 'application/json',
            'accept' => 'application/json',
            'authorization' => 'Basic c2tfdGVzdF9kVWZYZURHcDJXeEZ6eEdZWWFGRGJHOHg6'
        ]
    ];

    $response = $client->request('POST', 'https://api.paymongo.com/v1/qrph/generate', $requestData);
    $responseData = json_decode($response->getBody()->getContents());

    // Extract just the QR code data and relevant information
    echo json_encode([
        'success' => true,
        'data' => [
            'qr_string' => $responseData->data->attributes->qr_string ?? null,
            'qr_image' => $responseData->data->attributes->qr_image ?? null,
            'amount' => $data->amount,
            'reference' => $responseData->data->id ?? null
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}