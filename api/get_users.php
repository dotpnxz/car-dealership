<?php
// Start output buffering
ob_start();

// Enable CORS for local development
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['accountType'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Prepare SQL statement
    $sql = "SELECT id, username, fullname, contactNo, gender, birthDay, birthMonth, birthYear, address, accountType FROM users";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Clear any previous output
    ob_clean();
    echo json_encode($users, JSON_UNESCAPED_UNICODE);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("User management error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit();
}
?> 