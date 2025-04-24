<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering
ob_start();

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['accountType'] !== 'admin') {
    ob_clean();
    http_response_code(403);
    echo json_encode(['error' => 'Not authorized']);
    exit();
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Prepare SQL statement to get staff members
    $stmt = $conn->prepare("
        SELECT id, fullname, contactNo
        FROM users
        WHERE accountType = 'staff'
        ORDER BY fullname ASC
    ");

    $stmt->execute();
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Clear any previous output
    ob_clean();
    echo json_encode($staff);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("Staff list error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("General error in get_staff.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit();
}
?> 