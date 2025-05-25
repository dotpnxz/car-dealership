<?php
session_start();

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
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

try {
    // Verify user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("User not authenticated");
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['user_id', 'car_model', 'booking_date', 'booking_time'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    $conn = db_connect();
    
    // Get total number of staff accounts
    $staff_count_sql = "SELECT COUNT(*) FROM users WHERE accountType = 'staff'";
    $staff_count_stmt = $conn->prepare($staff_count_sql);
    $staff_count_stmt->execute();
    $total_staff = $staff_count_stmt->fetchColumn();

    // If no staff, set minimum of 1 to avoid division by zero
    $max_daily_bookings = max(1, $total_staff);
    
    // Check total CONFIRMED bookings for the requested date
    $daily_limit_sql = "SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = DATE(?) AND status = 'confirmed'";
    $daily_limit_stmt = $conn->prepare($daily_limit_sql);
    $daily_limit_stmt->execute([$data['booking_date']]);
    $confirmed_bookings_for_date = $daily_limit_stmt->fetchColumn();

    if ($confirmed_bookings_for_date >= $max_daily_bookings) {
        throw new Exception("Sorry, we've reached our maximum confirmed booking capacity for this date. Please select another date.");
    }

    // Check for booking frequency in the last 7 days
    $frequency_check_sql = "SELECT COUNT(*) FROM bookings 
                           WHERE user_id = ? 
                           AND booking_date BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND ?";
    $frequency_check_stmt = $conn->prepare($frequency_check_sql);
    $frequency_check_stmt->execute([
        $data['user_id'],
        $data['booking_date'],
        $data['booking_date']
    ]);
    $recent_bookings_count = $frequency_check_stmt->fetchColumn();

    if ($recent_bookings_count >= 2) {
        throw new Exception("You've reached the maximum limit of 2 bookings per week. Please try again later.");
    }

    // Check if user already has a booking for this date
    $check_sql = "SELECT COUNT(*) FROM bookings WHERE user_id = ? AND DATE(booking_date) = DATE(?)";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->execute([$data['user_id'], $data['booking_date']]);
    $booking_count = $check_stmt->fetchColumn();

    if ($booking_count > 0) {
        throw new Exception("To avoid spamming you are only allowed to book once a day");
    }
    
    $sql = "INSERT INTO bookings (user_id, car_model, booking_date, booking_time, notes, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $conn->prepare($sql);
    $success = $stmt->execute([
        $data['user_id'],
        $data['car_model'],
        $data['booking_date'],
        $data['booking_time'],
        $data['notes'] ?? ''
    ]);

    if (!$success) {
        throw new Exception("Failed to create booking");
    }

    echo json_encode(['success' => true, 'message' => 'Booking created successfully']);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>