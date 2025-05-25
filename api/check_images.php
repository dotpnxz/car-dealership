<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering
ob_start();

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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Check if table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'car_images'");
    if ($stmt->rowCount() === 0) {
        throw new Exception('car_images table does not exist');
    }
    
    // Get table structure
    $stmt = $conn->query("DESCRIBE car_images");
    $structure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get sample data
    $stmt = $conn->query("SELECT * FROM car_images LIMIT 5");
    $sampleData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count
    $stmt = $conn->query("SELECT COUNT(*) FROM car_images");
    $totalCount = $stmt->fetchColumn();
    
    // Clear any previous output
    ob_clean();
    echo json_encode([
        'table_exists' => true,
        'structure' => $structure,
        'sample_data' => $sampleData,
        'total_count' => $totalCount
    ]);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("Check images error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("General error in check_images.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit();
}
?>