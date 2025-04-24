<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['accountType'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

require 'db_connect.php';

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing user ID']);
        exit();
    }

    // Prevent deleting the last admin
    $stmt = $conn->prepare("SELECT COUNT(*) as adminCount FROM users WHERE accountType = 'admin'");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result['adminCount'] <= 1) {
        $stmt = $conn->prepare("SELECT accountType FROM users WHERE id = ?");
        $stmt->execute([$data['id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user['accountType'] === 'admin') {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete the last admin user']);
            exit();
        }
    }

    // Delete user
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode(['message' => 'User deleted successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?> 