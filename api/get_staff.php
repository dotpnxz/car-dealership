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
        SELECT id, 
            CONCAT(
                surname,
                ' ',
                firstname,
                CASE 
                    WHEN middlename IS NOT NULL AND middlename != '' THEN CONCAT(' ', middlename)
                    ELSE ''
                END,
                CASE 
                    WHEN suffix IS NOT NULL AND suffix != '' THEN CONCAT(' ', suffix)
                    ELSE ''
                END
            ) AS fullname,
            contactNo
        FROM users
        WHERE accountType = 'staff'
        ORDER BY surname ASC, firstname ASC
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