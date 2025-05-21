<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start output buffering
ob_start();

header('Content-Type: application/json');
// Add this line to allow requests from your React app's origin
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true"); // needed for 'include' credentials option in fetch
require_once 'db_connect.php';

try {
    $today = date('Y-m-d');
    
    $query = "SELECT 
        b.*, 
        CONCAT(u.surname, ', ', u.firstName, 
            COALESCE(CONCAT(' ', u.middleName), ''),
            COALESCE(CONCAT(' ', u.suffix), '')
        ) as customer_name,
        c.title as car_title
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN cars c ON b.car_id = c.id
        WHERE DATE(b.booking_date) = ?
        ORDER BY b.booking_time ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $bookings
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Clear output buffer and send content
ob_end_flush();

$conn->close();
?>
