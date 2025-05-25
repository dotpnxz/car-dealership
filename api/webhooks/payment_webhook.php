<?php
// Set log file directly in webhooks folder
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/webhook.log');
error_reporting(E_ALL);

// For webhooks, we only need to accept PayMongo requests
header('Content-Type: application/json');

require_once(__DIR__ . '/../../config/config.php');
require_once(__DIR__ . '/../../api/db_connect.php');

$conn = db_connect();
if (!$conn) {
    error_log("Webhook: Failed to establish database connection.");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
    exit();
}

// Get and log the webhook payload
$rawPayload = file_get_contents('php://input');
error_log("\n\n=== New Payment Webhook Request ===");
error_log("Timestamp: " . date('Y-m-d H:i:s'));
error_log("Request URL: " . $_SERVER['REQUEST_URI']);
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Client IP: " . $_SERVER['REMOTE_ADDR']);
error_log("Headers: " . print_r(getallheaders(), true));
error_log("Raw Payload: " . $rawPayload);

try {
    // Verify PayMongo webhook signature
    $signingKey = "whsk_wU3x2nAWBrCqThMkU7vm2Sfa"; // Hardcode for testing
    
    // Get PayMongo signature parts
    $payMongoSignature = $_SERVER['HTTP_PAYMONGO_SIGNATURE'] ?? '';
    if (!$payMongoSignature) {
        throw new Exception("Missing webhook signature");
    }

    error_log("Full signature header: " . $payMongoSignature);

    // Parse signature components
    $sigParts = [];
    foreach (explode(',', $payMongoSignature) as $part) {
        if (strpos($part, '=') !== false) {
            list($key, $value) = explode('=', $part);
            $sigParts[$key] = $value;
        }
    }

    // Get timestamp and signature
    $timestamp = $sigParts['t'] ?? '';
    $signature = $sigParts['te'] ?? '';

    error_log("Timestamp from header: " . $timestamp);
    error_log("Signature from header: " . $signature);

    // Create the signed payload exactly as PayMongo expects
    $signedPayload = $timestamp . "." . $rawPayload;
    
    // Compute signature using the confirmed webhook key
    $computedSignature = hash_hmac('sha256', $signedPayload, $signingKey);

    error_log("Computed signature: " . $computedSignature);
    error_log("Signed payload: " . $signedPayload);

    // Verify signature with strict comparison
    if (!hash_equals($computedSignature, $signature)) {
        throw new Exception("Invalid webhook signature");
    }

    $event = json_decode($rawPayload, true);
    if (!$event) {
        throw new Exception("Invalid JSON payload");
    }

    $attributes = $event['data']['attributes'] ?? null;
    if (!$attributes) {
        throw new Exception("Missing attributes in payload");
    }    if ($attributes['type'] === 'payment.paid' || $event['type'] === 'payment.paid') {
        error_log("Event data structure: " . json_encode($event, JSON_PRETTY_PRINT));
        
        // PayMongo nests the payment data under data.attributes.data
        $paymentData = $attributes['data'] ?? null;
        if (!$paymentData) {
            throw new Exception("Missing payment data in webhook");
        }
        
        $paymentAttributes = $paymentData['attributes'] ?? null;
        if (!$paymentAttributes) {
            throw new Exception("Missing payment attributes in webhook");
        }
        
        $paymentId = $paymentData['id'] ?? null;
        $amount = ($paymentAttributes['amount'] ?? 0) / 100; // Convert centavos to pesos
        
        error_log("Processing payment ID: " . $paymentId);
        
        // Add detailed logging of the payment data structure at each level
        error_log("Payment Data: " . json_encode($paymentData, JSON_PRETTY_PRINT));
        error_log("Payment Attributes: " . json_encode($paymentAttributes, JSON_PRETTY_PRINT));        // Try multiple approaches to find the payment reference
        $paymentReference = null;
        
        // First check external reference number (this is what we set in generate_payment_link.php)
        if (!empty($paymentAttributes['external_reference_number'])) {
            error_log("Looking up reference by external_reference_number: " . $paymentAttributes['external_reference_number']);
            // Try to find the reservation ID
            $findRefSql = "SELECT id, payment_reference FROM reserved_cars WHERE id = ? LIMIT 1";
            $findRefStmt = $conn->prepare($findRefSql);
            if ($findRefStmt && $findRefStmt->execute([$paymentAttributes['external_reference_number']])) {
                $result = $findRefStmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    $paymentReference = $result['payment_reference'];
                    error_log("Found payment reference in database: " . $paymentReference);
                } else {
                    error_log("No reservation found with ID: " . $paymentAttributes['external_reference_number']);
                }
            } else {
                error_log("Database error while looking up reservation");
            }
        }
        
        // If still not found, try the description
        if (!$paymentReference && !empty($paymentAttributes['description'])) {
            if (preg_match('/RES\d+_\d+/', $paymentAttributes['description'], $matches)) {
                $paymentReference = $matches[0];
                error_log("Found payment reference in description: " . $paymentReference);
            }
        }
        
        error_log("Payment Data: " . json_encode($paymentData));
        error_log("Payment Attributes: " . json_encode($paymentAttributes));

        error_log("Payment Amount: " . $amount);
        error_log("Payment Reference: " . $paymentReference);

        if (!$paymentReference) {
            throw new Exception("Missing payment reference");
        }

        if ($amount > 0) {            // Update payment_status from pending to paid            // First verify the reservation exists and is pending
            $checkSql = "SELECT id, payment_status FROM reserved_cars WHERE payment_reference = ?";
            $checkStmt = $conn->prepare($checkSql);
            if (!$checkStmt || !$checkStmt->execute([$paymentReference])) {
                throw new Exception("Failed to check reservation status");
            }
            
            $reservation = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$reservation) {
                throw new Exception("No reservation found with reference: " . $paymentReference);
            }
            
            if ($reservation['payment_status'] !== 'pending') {
                error_log("Warning: Reservation " . $paymentReference . " is not in pending state (current: " . $reservation['payment_status'] . ")");
            }

            $sql = "UPDATE reserved_cars SET
                        payment_status = 'paid',
                        payment_amount = ?,
                        updated_at = NOW()
                    WHERE payment_reference = ?";

            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Database prepare failed");
            }

            $stmt->bindValue(1, $amount, PDO::PARAM_STR);
            $stmt->bindValue(2, $paymentReference, PDO::PARAM_STR);if (!$stmt->execute()) {
                throw new Exception("Failed to update payment status");
            }

            error_log("Payment status updated successfully for payment reference: {$paymentReference}");
            
            // Get the car_id from the reservation
            $selectSql = "SELECT car_id FROM reserved_cars WHERE payment_reference = ?";
            $selectStmt = $conn->prepare($selectSql);
            if (!$selectStmt) {
                throw new Exception("Failed to prepare car selection statement");
            }

            $selectStmt->bindValue(1, $paymentReference, PDO::PARAM_STR);
            if (!$selectStmt->execute()) {
                throw new Exception("Failed to get car_id");
            }

            $result = $selectStmt->fetch(PDO::FETCH_ASSOC);
            if ($result && isset($result['car_id'])) {
                // Update the car's status to reserved
                $updateCarSql = "UPDATE cars SET status = 'reserved' WHERE id = ?";
                $updateCarStmt = $conn->prepare($updateCarSql);
                if (!$updateCarStmt) {
                    throw new Exception("Failed to prepare car update statement");
                }

                $updateCarStmt->bindValue(1, $result['car_id'], PDO::PARAM_INT);
                if (!$updateCarStmt->execute()) {
                    throw new Exception("Failed to update car status");
                }

                error_log("Car status updated to reserved for car_id: " . $result['car_id']);
            }
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