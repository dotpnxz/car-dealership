<?php
// Set CORS headers first
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

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
require 'db_connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['reservation_id'])) {
        throw new Exception('Reservation ID is required');
    }

    $conn = db_connect();
    
    // Verify the reservation belongs to the current user and is either pending or confirmed
    $stmt = $conn->prepare("SELECT id FROM reserved_cars WHERE id = ? AND user_id = ? AND payment_status IN ('pending')");
    $stmt->execute([$data['reservation_id'], $_SESSION['user_id']]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('Reservation not found or unauthorized');
    }

    // Update the reservation status
    $updateStmt = $conn->prepare("UPDATE reserved_cars SET payment_status = 'cancelled' WHERE id = ?");
    $updateStmt->execute([$data['reservation_id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Reservation cancelled successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
