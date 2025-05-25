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
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    $car_id = $_GET['car_id'] ?? null;
    
    if (!$car_id) {
        throw new Exception('Car ID is required');
    }

    $stmt = $conn->prepare("
        SELECT image_path, is_primary 
        FROM car_images 
        WHERE car_id = ? 
        ORDER BY is_primary DESC, created_at ASC
    ");
    $stmt->execute([$car_id]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Dynamically set base URL for root deployment
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . $host . '/uploads/cars/';

    $images = array_map(function($image) use ($baseUrl) {
        $imagePath = ltrim($image['image_path'], '/');
        if (strpos($imagePath, 'uploads/cars/') === 0) {
            $imagePath = substr($imagePath, strlen('uploads/cars/'));
        }
        return [
            'url' => $baseUrl . $imagePath,
            'is_primary' => (bool)$image['is_primary']
        ];
    }, $images);

    // Clear any previous output
    ob_clean();
    echo json_encode($images);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("Car images error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("General error in get_car_images.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
    exit();
}
?>