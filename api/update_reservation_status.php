<?php
// Start output buffering
ob_start();

// Set headers
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
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Debug session and cookie data
error_log("Update Status - Session ID: " . session_id());
error_log("Update Status - Cookie data: " . print_r($_COOKIE, true));
error_log("Update Status - Full Session data: " . print_r($_SESSION, true));

$accountTypeFromSession = isset($_SESSION['accountType']) ? $_SESSION['accountType'] : 'not set';
error_log("Update Status - Account Type from Session Variable: " . $accountTypeFromSession);

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    error_log("Update Status - User not logged in");
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

// Check if user is admin or staff
if ($accountTypeFromSession !== 'admin' && $accountTypeFromSession !== 'staff') {
    error_log("Update Status - User is not admin or staff. Account Type: " . $accountTypeFromSession);
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Only admin or staff users can update reservation status']);
    exit;
}

require 'db_connect.php';

try {
    // Get POST data
    $rawData = file_get_contents('php://input');
    error_log("Update Status - Raw POST data: " . $rawData);

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    if (!isset($data['reservation_id']) || !isset($data['payment_status'])) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit();
    }
    $reservationId = $data['reservation_id'];
    $newPaymentStatus = $data['payment_status'];

    error_log("Update Status - Reservation ID received: " . $reservationId);
    error_log("Update Status - New Status received: " . $newPaymentStatus);

    $conn = db_connect();

    // Check if reservation exists
    $stmtCheck = $conn->prepare("SELECT id FROM reserved_cars WHERE id = ?");
    $stmtCheck->execute([$reservationId]);
    if ($stmtCheck->rowCount() === 0) {
        throw new Exception('Reservation not found');
    }

    // Update the status
    $stmtUpdate = $conn->prepare("UPDATE reserved_cars SET payment_status = :new_payment_status WHERE id = :reservation_id");
    $stmtUpdate->bindParam(':new_payment_status', $newPaymentStatus, PDO::PARAM_STR);
    $stmtUpdate->bindParam(':reservation_id', $reservationId, PDO::PARAM_INT);
    $updateSuccess = $stmtUpdate->execute();

    if ($updateSuccess) {
        // Clear any previous output
        ob_clean();

        $response = [
            'success' => true,
            'message' => 'Reservation status updated successfully',
            'debug' => [
                'session_id' => session_id(),
                'user_id' => $_SESSION['user_id'],
                'account_type' => $_SESSION['accountType'],
                'updated_reservation_id' => $reservationId,
                'new_status' => $newPaymentStatus
            ]
        ];
        error_log("Update Status - Success Response: " . json_encode($response));
        echo json_encode($response);
    } else {
        error_log("Update Status - Database update failed. Error Info: " . print_r($stmtUpdate->errorInfo(), true));
        http_response_code(500); // Internal Server Error
        echo json_encode(['success' => false, 'error' => 'Failed to update reservation status in the database']);
    }

} catch (Exception $e) {
    // Clear any previous output
    ob_clean();

    error_log("Update Status - Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// End output buffering
ob_end_flush();
?>