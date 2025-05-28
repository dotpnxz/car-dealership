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
    }

    if ($attributes['type'] === 'payment.paid' || $event['type'] === 'payment.paid') {
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
        error_log("Payment Attributes: " . json_encode($paymentAttributes, JSON_PRETTY_PRINT));

        // Try multiple approaches to find the payment reference
        $paymentReference = null;
        $transactionType = null;
        
        // First check external reference number
        if (!empty($paymentAttributes['external_reference_number'])) {
            error_log("Looking up reference by external_reference_number: " . $paymentAttributes['external_reference_number']);
            
            // Check both purchases and reservations
            $findRefSql = "
                SELECT 'purchase' as type, id, payment_reference 
                FROM purchases 
                WHERE id = ? 
                UNION 
                SELECT 'reservation' as type, id, payment_reference 
                FROM reserved_cars 
                WHERE id = ?
            ";
            $findRefStmt = $conn->prepare($findRefSql);
            if ($findRefStmt && $findRefStmt->execute([
                $paymentAttributes['external_reference_number'],
                $paymentAttributes['external_reference_number']
            ])) {
                $result = $findRefStmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    $paymentReference = $result['payment_reference'];
                    $transactionType = $result['type'];
                    error_log("Found payment reference in database: " . $paymentReference . " (Type: " . $transactionType . ")");
                } else {
                    error_log("No transaction found with ID: " . $paymentAttributes['external_reference_number']);
                }
            } else {
                error_log("Database error while looking up transaction");
            }
        }
        
        // If still not found, try the description
        if (!$paymentReference && !empty($paymentAttributes['description'])) {
            if (preg_match('/(PUR|RES)\d+_\d+/', $paymentAttributes['description'], $matches)) {
                $paymentReference = $matches[0];
                $transactionType = strpos($paymentReference, 'PUR') === 0 ? 'purchase' : 'reservation';
                error_log("Found payment reference in description: " . $paymentReference . " (Type: " . $transactionType . ")");
            }
        }

        if (!$paymentReference) {
            throw new Exception("Missing payment reference");
        }

        if ($amount > 0) {
            // Determine which table to update based on transaction type
            $tableName = $transactionType === 'purchase' ? 'purchases' : 'reserved_cars';
            
            // First verify the transaction exists and get its details
            $checkSql = "SELECT id, payment_status, car_id, reservation_type, payment_amount, car_price FROM $tableName WHERE payment_reference = ?";
            $checkStmt = $conn->prepare($checkSql);
            if (!$checkStmt || !$checkStmt->execute([$paymentReference])) {
                throw new Exception("Failed to check transaction status");
            }
            
            $transaction = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$transaction) {
                throw new Exception("No transaction found with reference: " . $paymentReference);
            }

            // Determine the new payment status
            $newPaymentStatus = 'paid';
            $newCarStatus = 'reserved';
            $totalAmount = floatval($amount); // Default to new payment amount

            // For reservations with full payment type, check if this is the remaining balance
            if ($transactionType === 'reservation' && 
                $transaction['reservation_type'] === 'full') {
                
                // Get the car price from the cars table
                $carSql = "SELECT price FROM cars WHERE id = ?";
                $carStmt = $conn->prepare($carSql);
                $carStmt->execute([$transaction['car_id']]);
                $car = $carStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($car) {
                    $carPrice = floatval($car['price']);
                    $currentPayment = floatval($transaction['payment_amount']);
                    $newPayment = floatval($amount);
                    $totalAmount = $currentPayment + $newPayment; // Calculate total amount paid
                    
                    error_log("Payment details - Car Price: $carPrice, Current Payment: $currentPayment, New Payment: $newPayment, Total Amount: $totalAmount");
                    
                    // If total amount matches car price (within 0.01 for float comparison)
                    if (abs($totalAmount - $carPrice) < 0.01) {
                        $newPaymentStatus = 'completed';
                        $newCarStatus = 'sold';
                        error_log("Total amount matches car price - updating to completed status");
                    }
                }
            }

            // Update payment status
            $sql = "UPDATE $tableName SET
                        payment_status = ?,
                        payment_amount = ?,
                        updated_at = NOW()
                    WHERE payment_reference = ?";

            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Database prepare failed");
            }

            $stmt->bindValue(1, $newPaymentStatus, PDO::PARAM_STR);
            $stmt->bindValue(2, $totalAmount, PDO::PARAM_STR); // Use total amount
            $stmt->bindValue(3, $paymentReference, PDO::PARAM_STR);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to update payment status");
            }

            error_log("Payment status updated successfully for payment reference: {$paymentReference} to status: {$newPaymentStatus} with total amount: {$totalAmount}");
            
            // Update car status
            if ($transaction['car_id']) {
                $updateCarSql = "UPDATE cars SET status = ? WHERE id = ?";
                $updateCarStmt = $conn->prepare($updateCarSql);
                if (!$updateCarStmt) {
                    throw new Exception("Failed to prepare car update statement");
                }

                $updateCarStmt->bindValue(1, $newCarStatus, PDO::PARAM_STR);
                $updateCarStmt->bindValue(2, $transaction['car_id'], PDO::PARAM_INT);
                
                if (!$updateCarStmt->execute()) {
                    throw new Exception("Failed to update car status");
                }

                error_log("Car status updated to {$newCarStatus} for car_id: " . $transaction['car_id']);
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