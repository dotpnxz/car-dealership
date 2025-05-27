<?php
header('Content-Type: application/json');
require_once 'db_connect.php';
session_start();

// Check if the user is logged in and is an admin or staff
if (!isset($_SESSION['user_id']) || ($_SESSION['accountType'] !== 'admin' && $_SESSION['accountType'] !== 'staff')) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

try {
    $conn = db_connect();
    $data = json_decode(file_get_contents('php://input'), true);

    $requirement_id = $data['requirement_id'] ?? null;
    $status = $data['status'] ?? null;

    // Validate input
    if (!$requirement_id || !$status || !in_array($status, ['approved', 'rejected'])) {
        throw new Exception('Invalid input');
    }

    // Prepare and execute the update statement
    $stmt = $conn->prepare("UPDATE loan_requirements SET car_loan_status = ? WHERE id = ?");
    $stmt->execute([$status, $requirement_id]);

    // Check if the update was successful (optional, but good practice)
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Loan status updated successfully']);
    } else {
        // This could happen if the requirement_id doesn't exist
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Requirement not found or status already set']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 