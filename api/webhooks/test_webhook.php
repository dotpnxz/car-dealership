<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/webhook.log');

header('Content-Type: application/json');

// Log all incoming request data
$requestBody = file_get_contents('php://input');
$timestamp = date('Y-m-d H:i:s');
$headers = getallheaders();

// Create detailed log entry
error_log("=== TEST MODE WEBHOOK - For Educational Purposes Only ===");
error_log("=== Webhook Test Request at $timestamp ===");
error_log("Headers: " . json_encode($headers, JSON_PRETTY_PRINT));
error_log("Body: " . $requestBody);

// Verify PayMongo signature
$signingKey = getenv('PAYMONGO_WEBHOOK_SECRET_KEY');
$signature = isset($headers['Paymongo-Signature']) ? $headers['Paymongo-Signature'] : '';

if ($signature) {
    error_log("Signature received: " . $signature);
}

echo json_encode([
    'success' => true,
    'message' => 'Webhook test received and logged',
    'timestamp' => $timestamp
]);