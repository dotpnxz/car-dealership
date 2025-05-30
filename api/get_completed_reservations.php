<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/../config/config.php');
require_once(__DIR__ . '/db_connect.php');

try {
    $conn = db_connect();
    
    // Get user ID from session
    session_start();
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not authenticated');
    }
    $userId = $_SESSION['user_id'];

    // Fetch completed reservations with car details
    $sql = "SELECT rc.*, c.title, c.price as car_price 
            FROM reserved_cars rc 
            JOIN cars c ON rc.car_id = c.id 
            WHERE rc.user_id = ? AND rc.payment_status = 'completed'
            ORDER BY rc.reservation_date DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute([$userId]);
    
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'reservations' => $reservations
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>