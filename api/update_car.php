<?php
// Enable error reporting and logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering
ob_start();

// Set headers
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

// Start session
session_start();

// Check if user is logged in and is either admin or staff
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['accountType'], ['admin', 'staff'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authorized']);
    exit();
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Get POST data
    $carId = $_POST['carId'] ?? '';
    $title = $_POST['title'] ?? '';
    $price = $_POST['price'] ?? '';
    $category = $_POST['category'] ?? '';
    $brand = $_POST['brand'] ?? '';
    $variant = $_POST['variant'] ?? '';
    $mileage = $_POST['mileage'] ?? '';
    $transmission = $_POST['transmission'] ?? '';
    $condition = $_POST['condition'] ?? '';
    $seating = $_POST['seating'] ?? '';
    $status = $_POST['status'] ?? 'available';

    // Validate required fields
    if (empty($carId) || empty($title) || empty($price) || empty($category) || 
        empty($brand) || empty($variant) || empty($mileage) || empty($transmission) || 
        empty($condition) || empty($seating)) {
        throw new Exception('All fields are required');
    }

    // Validate price (decimal)
    if (!is_numeric($price)) {
        throw new Exception('Price must be a number');
    }
    $price = floatval($price);

    // Validate status
    $allowedStatuses = ['available', 'reserved', 'acquired'];
    if (!in_array($status, $allowedStatuses)) {
        throw new Exception('Invalid status value');
    }

    // Trim any whitespace
    $mileage = trim($mileage);
    $seating = trim($seating);

    // First, check if the car exists
    $checkStmt = $conn->prepare("SELECT * FROM cars WHERE id = :id");
    $checkStmt->bindParam(':id', $carId, PDO::PARAM_INT);
    $checkStmt->execute();
    $existingCar = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingCar) {
        throw new Exception('Car not found with ID: ' . $carId);
    }

    // Prepare SQL statement
    $sql = "UPDATE cars SET 
            title = :title, 
            price = :price, 
            category = :category, 
            brand = :brand, 
            variant = :variant, 
            mileage = :mileage, 
            transmission = :transmission, 
            `condition` = :condition, 
            seating = :seating,
            status = :status 
            WHERE id = :id";
    $stmt = $conn->prepare($sql);
    
    // Bind parameters
    $stmt->bindParam(':title', $title, PDO::PARAM_STR);
    $stmt->bindParam(':price', $price, PDO::PARAM_STR);
    $stmt->bindParam(':category', $category, PDO::PARAM_STR);
    $stmt->bindParam(':brand', $brand, PDO::PARAM_STR);
    $stmt->bindParam(':variant', $variant, PDO::PARAM_STR);
    $stmt->bindParam(':mileage', $mileage, PDO::PARAM_STR);
    $stmt->bindParam(':transmission', $transmission, PDO::PARAM_STR);
    $stmt->bindParam(':condition', $condition, PDO::PARAM_STR);
    $stmt->bindParam(':seating', $seating, PDO::PARAM_STR);
    $stmt->bindParam(':status', $status, PDO::PARAM_STR);
    $stmt->bindParam(':id', $carId, PDO::PARAM_INT);
    
    // Execute the statement
    if ($stmt->execute()) {
        // Clear output buffer
        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Car updated successfully'
        ]);
    } else {
        $errorInfo = $stmt->errorInfo();
        error_log("SQL Error: " . print_r($errorInfo, true));
        throw new Exception('Failed to update car: ' . $errorInfo[2]);
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error occurred: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    ob_clean();
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt = null;
    }
    if (isset($conn)) {
        $conn = null;
    }
}
?>