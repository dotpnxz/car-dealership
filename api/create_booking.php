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
$required_fields = ['car_model', 'booking_date', 'booking_time'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Prepare SQL statement
    $stmt = $conn->prepare("
        INSERT INTO bookings (
            user_id, 
            car_model, 
            booking_date, 
            booking_time, 
            notes, 
            status
        ) VALUES (
            :user_id, 
            :car_model, 
            :booking_date, 
            :booking_time, 
            :notes, 
            'pending'
        )
    ");

    // Execute the statement
    $stmt->execute([
        ':user_id' => $_SESSION['user_id'],
        ':car_model' => $data['car_model'],
        ':booking_date' => $data['booking_date'],
        ':booking_time' => $data['booking_time'],
        ':notes' => $data['notes'] ?? null
    ]);

    // Get the new booking ID
    $booking_id = $conn->lastInsertId();

    // Clear any previous output
    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Booking created successfully',
        'booking_id' => $booking_id
    ]);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("Booking creation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("General error in create_booking.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit();
}
?> 