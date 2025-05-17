<?php
session_start();
require_once 'db_connect.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check authentication
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['accountType'], ['admin', 'staff'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    $conn = db_connect();
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['applicationId']) || !isset($data['status'])) {
        throw new Exception('Missing required fields');
    }

    $applicationId = $data['applicationId'];
    $status = $data['status'];
    $userId = $_SESSION['user_id'];

    // Validate status
    $allowedStatuses = ['pending', 'approved', 'rejected'];
    if (!in_array($status, $allowedStatuses)) {
        throw new Exception('Invalid status value');
    }

    // Update the status
    $stmt = $conn->prepare("
        UPDATE car_applications 
        SET status = ?, 
            updated_at = CURRENT_TIMESTAMP,
            updated_by = ?
        WHERE id = ?
    ");

    $stmt->execute([$status, $userId, $applicationId]);

    if ($stmt->rowCount() === 0) {
        throw new Exception('Application not found');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Status updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>