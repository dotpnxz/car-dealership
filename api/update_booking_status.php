<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering
ob_start();

// Enable CORS for local development
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    ob_clean();
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit();
}

// Get POST data
$raw_data = file_get_contents('php://input');
$data = json_decode($raw_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
if (!isset($data['booking_id']) || !isset($data['status'])) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

// If status is cancelled and user is admin, require cancellation reason
if ($data['status'] === 'cancelled' && $_SESSION['accountType'] === 'admin' && !isset($data['cancellation_reason'])) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Cancellation reason is required']);
    exit();
}

// Validate status
$allowed_statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
if (!in_array($data['status'], $allowed_statuses)) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status']);
    exit();
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Check if the booking exists and belongs to the user (if not admin/staff)
    $check_stmt = $conn->prepare("
        SELECT id, user_id, assigned_to, status 
        FROM bookings 
        WHERE id = :booking_id
    ");
    $check_stmt->execute([':booking_id' => $data['booking_id']]);
    $booking = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$booking) {
        ob_clean();
        http_response_code(404);
        echo json_encode(['error' => 'Booking not found']);
        exit();
    }

    // If user is not admin/staff, check if they own the booking
    if ($_SESSION['accountType'] !== 'admin' && $_SESSION['accountType'] !== 'staff' && $booking['user_id'] != $_SESSION['user_id']) {
        ob_clean();
        http_response_code(403);
        echo json_encode(['error' => 'Not authorized to update this booking']);
        exit();
    }

    // If user is staff, check if they are assigned to this booking
    if ($_SESSION['accountType'] === 'staff' && $booking['assigned_to'] != $_SESSION['user_id']) {
        ob_clean();
        http_response_code(403);
        echo json_encode(['error' => 'Not authorized to update this booking']);
        exit();
    }

    // If user is not admin, they can only cancel their own bookings or complete assigned bookings
    if ($_SESSION['accountType'] !== 'admin') {
        if ($data['status'] === 'cancelled' && $booking['user_id'] != $_SESSION['user_id']) {
            ob_clean();
            http_response_code(403);
            echo json_encode(['error' => 'Users can only cancel their own bookings']);
            exit();
        }
        
        // Staff can only update status to completed if they are assigned to the booking
        if ($_SESSION['accountType'] === 'staff' && $data['status'] === 'completed' && $booking['assigned_to'] != $_SESSION['user_id']) {
            ob_clean();
            http_response_code(403);
            echo json_encode(['error' => 'Staff can only complete their assigned bookings']);
            exit();
        }
    }

    // Prepare SQL statement based on whether it's a cancellation with reason
    if ($data['status'] === 'cancelled' && $_SESSION['accountType'] === 'admin') {
        $stmt = $conn->prepare("
            UPDATE bookings 
            SET status = :status,
                cancellation_reason = :cancellation_reason
            WHERE id = :booking_id
        ");

        // Execute the statement with cancellation reason
        $stmt->execute([
            ':status' => $data['status'],
            ':booking_id' => $data['booking_id'],
            ':cancellation_reason' => $data['cancellation_reason']
        ]);
    } else {
        $stmt = $conn->prepare("
            UPDATE bookings 
            SET status = :status 
            WHERE id = :booking_id
        ");

        // Execute the statement without cancellation reason
        $stmt->execute([
            ':status' => $data['status'],
            ':booking_id' => $data['booking_id']
        ]);
    }

    // Clear any previous output
    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Booking status updated successfully'
    ]);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("Booking status update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("General error in update_booking_status.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit();
}
?> 