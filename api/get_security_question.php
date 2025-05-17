<?php
session_start();
require_once 'db_connect.php';

// Ensure no output before headers and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

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
    $conn = db_connect(); // Make sure we have a connection

    // Get and validate input
    $input = file_get_contents('php://input');
    if (!$input) {
        throw new Exception('No input received');
    }

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }
    
    if (!isset($data['username']) || empty(trim($data['username']))) {
        throw new Exception('Username is required');
    }

    $username = trim($data['username']);

    // Get security question for the user
    $stmt = $conn->prepare("
        SELECT security_question 
        FROM users 
        WHERE username = ?
        LIMIT 1
    ");
    
    if (!$stmt->execute([$username])) {
        $error = $stmt->errorInfo();
        error_log('Database error: ' . print_r($error, true));
        throw new PDOException('Database error occurred: ' . $error[2]);
    }

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result && isset($result['security_question'])) {
        echo json_encode([
            'success' => true,
            'security_question' => $result['security_question']
        ]);
    } else {
        throw new Exception('Username not found');
    }

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log('Application error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}