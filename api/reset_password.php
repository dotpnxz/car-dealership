<?php
session_start();
require_once 'db_connect.php';

// Set CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

try {
    $conn = db_connect();

    // Get and validate input
    $input = file_get_contents('php://input');
    if (!$input) {
        throw new Exception('No input received');
    }

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    if (!isset($data['username']) || !isset($data['security_answer']) || !isset($data['new_password'])) {
        throw new Exception('Missing required fields');
    }

    $username = trim($data['username']);
    $security_answer = trim($data['security_answer']);
    $new_password = $data['new_password'];

    // Verify security answer
    $stmt = $conn->prepare("
        SELECT id 
        FROM users 
        WHERE username = ? 
        AND security_answer = ?
    ");

    if (!$stmt->execute([$username, $security_answer])) {
        throw new PDOException('Failed to verify security answer');
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        throw new Exception('Invalid security answer');
    }

    // Update password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    $update_stmt = $conn->prepare("
        UPDATE users 
        SET password = ? 
        WHERE id = ?
    ");

    if (!$update_stmt->execute([$hashed_password, $user['id']])) {
        throw new PDOException('Failed to update password');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log('Application error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}