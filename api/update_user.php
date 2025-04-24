<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Disable error display
ini_set('log_errors', 1); // Enable error logging
ini_set('error_log', 'debug.log');

// Create debug log file
$debugLog = fopen('debug.log', 'a');
fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Update user request received\n");

// Set CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit();
}

// Start session with proper configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
ini_set('session.cookie_samesite', 'Lax');
session_start();

// Debug session data
fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Session ID: " . session_id() . "\n");
fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Session data: " . json_encode($_SESSION) . "\n");
fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Cookie data: " . json_encode($_COOKIE) . "\n");

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Not logged in']);
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Not logged in - user_id not set\n");
    exit();
}

if (!isset($_SESSION['accountType']) || $_SESSION['accountType'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Not an admin user']);
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Not an admin user - accountType: " . 
        (isset($_SESSION['accountType']) ? $_SESSION['accountType'] : 'not set') . "\n");
    exit();
}

// Get POST data
$rawData = file_get_contents('php://input');
fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Raw POST data: " . $rawData . "\n");

$data = json_decode($rawData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] JSON decode error: " . json_last_error_msg() . "\n");
    exit();
}

fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Decoded data: " . json_encode($data) . "\n");

// Validate required fields
if (!isset($data['id']) || !isset($data['username']) || !isset($data['fullname']) || 
    !isset($data['accountType'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Missing required fields\n");
    exit();
}

// Validate accountType is one of the allowed values
$allowedTypes = ['admin', 'staff', 'user'];
if (!in_array(strtolower($data['accountType']), $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid account type. Must be one of: ' . implode(', ', $allowedTypes)]);
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Invalid account type: " . $data['accountType'] . "\n");
    exit();
}

try {
    // Include database connection
    require_once 'db_connect.php';
    $conn = require 'db_connect.php';
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Database connection established\n");

    // First, let's check if the table exists
    $checkTable = $conn->query("SHOW TABLES LIKE 'users'");
    if ($checkTable->rowCount() == 0) {
        throw new Exception("Users table does not exist");
    }

    // Get table structure for debugging
    $tableInfo = $conn->query("DESCRIBE users");
    $columns = $tableInfo->fetchAll();
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Table structure: " . print_r($columns, true) . "\n");

    // Check if username already exists (excluding current user)
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $stmt->execute([$data['username'], $data['id']]);
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Username already exists']);
        fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Username already exists\n");
        exit();
    }

    // Update user
    $sql = "UPDATE users SET 
        username = ?,
        fullname = ?,
        contactNo = ?,
        gender = ?,
        birthDay = ?,
        birthMonth = ?,
        birthYear = ?,
        address = ?,
        accountType = ?" . 
        (isset($data['password']) && !empty($data['password']) ? ", password = ?" : "") . 
        " WHERE id = ?";

    $params = [
        $data['username'],
        $data['fullname'],
        $data['contactNo'],
        $data['gender'],
        $data['birthDay'],
        $data['birthMonth'],
        $data['birthYear'],
        $data['address'],
        $data['accountType']
    ];

    // Add password to params if provided
    if (isset($data['password']) && !empty($data['password'])) {
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $params[] = $hashedPassword;
    }

    // Add id to params
    $params[] = $data['id'];

$stmt = $conn->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found or no changes made']);
        fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] No rows affected\n");
        exit();
    }

    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] User updated successfully\n");
    echo json_encode(['message' => 'User updated successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Database error: " . $e->getMessage() . "\n");
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Error code: " . $e->getCode() . "\n");
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Error trace: " . $e->getTraceAsString() . "\n");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Server error: " . $e->getMessage() . "\n");
    fwrite($debugLog, "[" . date('Y-m-d H:i:s') . "] Error trace: " . $e->getTraceAsString() . "\n");
} finally {
    fclose($debugLog);
}
?> 