<?php
// Set log file directly in webhooks folder
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/webhook.log');
error_reporting(E_ALL);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, PayMongo-Signature');
    header('Access-Control-Max-Age: 86400');    // Cache preflight for 24 hours
    http_response_code(200);
    exit();
}

// Add CORS headers for actual requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, PayMongo-Signature');
header('Content-Type: application/json');

require_once(__DIR__ . '/../../config/config.php');
require_once(__DIR__ . '/../../api/db_connect.php');  // Fix path to db_connect.php

$conn = db_connect();
if (!$conn) {
    error_log("Webhook: Failed to establish database connection.");
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
    exit();
}

// Detailed request logging
$rawPayload = file_get_contents('php://input');
error_log("\n\n=== New Payment Webhook Request ===");
error_log("Timestamp: " . date('Y-m-d H:i:s'));
error_log("Raw Payload: " . $rawPayload);
error_log("Headers: " . json_encode(getallheaders(), JSON_PRETTY_PRINT));

try {
    $payload = $rawPayload;
    error_log("\n\n=== New Webhook Request ===");
    error_log("Raw payload: " . $payload);

    $event = json_decode($payload, true);
    if (!$event) {
        error_log("JSON decode failed: " . json_last_error_msg());
        throw new Exception("Invalid JSON payload");
    }

    // Log the complete event structure
    error_log("Event type: " . ($event['data']['type'] ?? 'unknown'));
    error_log("Full event data: " . print_r($event, true));

    // Correct path for attributes in PayMongo webhook
    $attributes = $event['data']['attributes'] ?? null;
    if (!$attributes) {
        throw new Exception("Missing attributes in payload");
    }

    error_log("Processing payment with attributes: " . print_r($attributes, true));

    if (isset($event['data']['attributes'])) {
        $attributes = $event['data']['attributes'];
        error_log("Payment attributes: " . print_r($attributes, true));

        if ($attributes['type'] === 'payment.paid') {
            // Get payment data from the correct location in the payload
            $paymentData = $attributes['data'];
            $paymentAttributes = $paymentData['attributes'];

            $paymentId = $paymentData['id'];
            $amount = ($paymentAttributes['amount'] ?? 0) / 100; // Convert centavos to pesos

            // Extract reservation ID from the description
            preg_match('/Reservation #(\d+)/', $paymentAttributes['description'], $matches);
            $referenceId = $matches[1] ?? null;

            error_log("Processing payment - ID: {$paymentId}, Amount: {$amount}, Reference: {$referenceId}");

            if (!$referenceId) {
                throw new Exception("Missing reference_id in payment data");
            }

            if ($amount > 0) {
                $sql = "UPDATE reserved_cars SET
                            status = 'reserved',
                            payment_status = 'paid',
                            payment_amount = ?,
                            updated_at = NOW()
                        WHERE id = ? AND status = 'confirmed' AND payment_status = 'pending'";

                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    throw new Exception("Database prepare failed: " . print_r($conn->errorInfo(), true));
                }

                error_log("Executing SQL update with amount: {$amount} and reference: {$referenceId}");
                $stmt->bindValue(1, $amount, PDO::PARAM_STR); // Use PDO::PARAM_STR for decimals
                $stmt->bindValue(2, $referenceId, PDO::PARAM_INT); // Assuming id is an integer

                if (!$stmt->execute()) {
                    throw new Exception("Database update failed: " . print_r($stmt->errorInfo(), true));
                }

                error_log("Database updated successfully. Affected rows: " . $stmt->rowCount());

                if ($stmt->rowCount() === 0) {
                    error_log("Warning: No rows were updated for Reference ID: {$referenceId}");
                }
            }
        } else {
            error_log("Ignoring non-payment event type: " . $attributes['type']);
        }
    }

    http_response_code(200);
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    error_log("Webhook Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}