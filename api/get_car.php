<?php
// Disable error reporting to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

// Start output buffering
ob_start();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db_connect.php';

try {
    if (!isset($_GET['id'])) {
        throw new Exception('Car ID is required');
    }

    $carId = $_GET['id'];
    $conn = db_connect();
    
    // Get specific car details including all fields
    $stmt = $conn->prepare("
        SELECT title, price, category, brand, variant, mileage, 
               chassis, transmission, fuel_type, `condition`, 
               seating, issues 
        FROM cars 
        WHERE id = ?
    ");
    $stmt->execute([$carId]);
    $car = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$car) {
        throw new Exception('Car not found');
    }

    // Clear any previous output
    ob_clean();
    
    echo json_encode([
        'success' => true,
        'data' => $car
    ]);

} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// End output buffering
ob_end_flush();