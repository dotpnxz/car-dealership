<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering
ob_start();

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
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Remove the login check and continue directly to the database query
try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Prepare SQL statement
    $sql = "SELECT * FROM cars ORDER BY id DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Clear any previous output
    ob_clean();
    echo json_encode($cars);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("Car management error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("General error in get_cars.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit();
}
?>