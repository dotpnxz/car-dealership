<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering
ob_start();

// Set CORS headers
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

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['accountType'] !== 'admin') {
    ob_clean();
    http_response_code(403);
    echo json_encode(['error' => 'Not authorized']);
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
if (!isset($data['booking_id']) || !isset($data['staff_id'])) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Booking ID and Staff ID are required']);
    exit();
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Check if the booking exists and is not already assigned
    $stmt = $conn->prepare("
        SELECT id, assigned_to 
        FROM bookings 
        WHERE id = :booking_id
    ");
    $stmt->execute([':booking_id' => $data['booking_id']]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$booking) {
        ob_clean();
        http_response_code(404);
        echo json_encode(['error' => 'Booking not found']);
        exit();
    }

    if ($booking['assigned_to']) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Booking is already assigned']);
        exit();
    }

    // Check if the staff member exists
    $stmt = $conn->prepare("
        SELECT id 
        FROM users 
        WHERE id = :staff_id AND accountType = 'staff'
    ");
    $stmt->execute([':staff_id' => $data['staff_id']]);
    $staff = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$staff) {
        ob_clean();
        http_response_code(404);
        echo json_encode(['error' => 'Staff member not found']);
        exit();
    }

    // Update the booking with the staff assignment
    $stmt = $conn->prepare("
        UPDATE bookings 
        SET assigned_to = :staff_id 
        WHERE id = :booking_id
    ");
    $stmt->execute([
        ':staff_id' => $data['staff_id'],
        ':booking_id' => $data['booking_id']
    ]);

    // Clear any previous output
    ob_clean();
    echo json_encode(['success' => true, 'message' => 'Booking assigned successfully']);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("Booking assignment error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("General error in assign_booking.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit();
}
?>