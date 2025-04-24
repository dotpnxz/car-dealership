<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Start output buffering
ob_start();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
    
    // Create cars table if it doesn't exist
    $conn->exec("CREATE TABLE IF NOT EXISTS `cars` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `price` DECIMAL(10,2) NOT NULL,
        `category` VARCHAR(50) NOT NULL,
        `brand` VARCHAR(50) NOT NULL,
        `variant` VARCHAR(50) NOT NULL,
        `mileage` VARCHAR(50) NOT NULL,
        `transmission` VARCHAR(50) NOT NULL,
        `condition` VARCHAR(50) NOT NULL,
        `seating` INT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create car_images table if it doesn't exist
    $conn->exec("CREATE TABLE IF NOT EXISTS `car_images` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `car_id` INT NOT NULL,
        `image_path` VARCHAR(255) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON DELETE CASCADE
    )");
    
    // Validate required fields
    $required_fields = ['title', 'price', 'category', 'brand', 'variant', 'mileage', 'transmission', 'condition', 'seating'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Prepare SQL statement
    $stmt = $conn->prepare("
        INSERT INTO cars (
            title, price, category, brand, variant, 
            mileage, transmission, `condition`, seating
        ) VALUES (
            :title, :price, :category, :brand, :variant,
            :mileage, :transmission, :condition, :seating
        )
    ");

    // Execute the statement
    $stmt->execute([
        ':title' => $_POST['title'],
        ':price' => $_POST['price'],
        ':category' => $_POST['category'],
        ':brand' => $_POST['brand'],
        ':variant' => $_POST['variant'],
        ':mileage' => $_POST['mileage'],
        ':transmission' => $_POST['transmission'],
        ':condition' => $_POST['condition'],
        ':seating' => $_POST['seating']
    ]);

    // Get the ID of the newly inserted car
    $car_id = $conn->lastInsertId();

    // Handle image uploads if any
    if (isset($_FILES['images'])) {
        $upload_dir = '../uploads/cars/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            $file_name = $_FILES['images']['name'][$key];
            $file_ext = pathinfo($file_name, PATHINFO_EXTENSION);
            $new_file_name = uniqid() . '.' . $file_ext;
            $upload_path = $upload_dir . $new_file_name;

            if (move_uploaded_file($tmp_name, $upload_path)) {
                // Insert image record into car_images table
                $image_stmt = $conn->prepare("
                    INSERT INTO car_images (car_id, image_path)
                    VALUES (:car_id, :image_path)
                ");
                $image_stmt->execute([
                    ':car_id' => $car_id,
                    ':image_path' => 'uploads/cars/' . $new_file_name
                ]);
            }
        }
    }

    // Clear any output buffer
    ob_clean();
    
    // Return success response with car ID
    echo json_encode([
        'success' => true,
        'message' => 'Car added successfully',
        'car_id' => $car_id
    ]);

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 