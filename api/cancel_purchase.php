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
    if (!isset($data['purchaseId'])) {
        throw new Exception('Purchase ID is required');
    }

    $conn = db_connect();
    
    // Verify the purchase belongs to the current user and is pending
    $stmt = $conn->prepare("SELECT id FROM purchases WHERE id = ? AND user_id = ? AND payment_status = 'pending'");
    $stmt->execute([$data['purchaseId'], $_SESSION['user_id']]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('Purchase not found or unauthorized');
    }

    // Update the purchase status
    $updateStmt = $conn->prepare("UPDATE purchases SET payment_status = 'cancelled' WHERE id = ?");
    $updateStmt->execute([$data['purchaseId']]);

    echo json_encode([
        'success' => true,
        'message' => 'Purchase cancelled successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 