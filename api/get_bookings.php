<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering
ob_start();

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

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Check if the request is from admin or user dashboard
    $isAdmin = isset($_SESSION['accountType']) && $_SESSION['accountType'] === 'admin';
    $isStaff = isset($_SESSION['accountType']) && $_SESSION['accountType'] === 'staff';
    
    // Prepare SQL statement
    $sql = "
        SELECT 
            b.id,
            b.car_model,
            b.booking_date,
            b.booking_time,
            b.notes,
            b.status,
            b.created_at,
            b.cancellation_reason,
            b.assigned_to,
            CONCAT(
                COALESCE(u.firstName, ''), ' ',
                COALESCE(u.middleName, ''), ' ',
                COALESCE(u.surname, ''),
                CASE WHEN u.suffix IS NOT NULL AND u.suffix != '' THEN CONCAT(' ', u.suffix) ELSE '' END
            ) as customer_name,
            u.contactNo as customer_phone,
            CONCAT(
                COALESCE(s.firstName, ''), ' ',
                COALESCE(s.middleName, ''), ' ',
                COALESCE(s.surname, ''),
                CASE WHEN s.suffix IS NOT NULL AND s.suffix != '' THEN CONCAT(' ', s.suffix) ELSE '' END
            ) as staff_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN users s ON b.assigned_to = s.id
        WHERE " . ($isAdmin ? "1=1" : ($isStaff ? "b.assigned_to = :user_id" : "b.user_id = :user_id")) . "
        ORDER BY b.booking_date DESC, b.booking_time DESC
    ";

    $stmt = $conn->prepare($sql);
    
    // If not admin, bind the user_id parameter
    if (!$isAdmin) {
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
    }
    
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Clear any previous output
    ob_clean();
    echo json_encode($bookings, JSON_UNESCAPED_UNICODE);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("Booking management error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("General error in get_bookings.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit();
}
?>