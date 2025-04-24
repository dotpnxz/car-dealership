<?php
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

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['accountType'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Not authorized']);
    exit();
}

try {
    $conn = require 'db_connect.php';
    
    // Create uploads directory if it doesn't exist
    $uploadDir = '../uploads/cars/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $response = [];
    $car_id = $_POST['car_id'] ?? null;
    
    if (!$car_id) {
        throw new Exception('Car ID is required');
    }

    // Handle multiple file uploads
    if (isset($_FILES['images'])) {
        $files = $_FILES['images'];
        $fileCount = count($files['name']);

        for ($i = 0; $i < $fileCount; $i++) {
            $fileName = $files['name'][$i];
            $fileTmpName = $files['tmp_name'][$i];
            $fileError = $files['error'][$i];

            if ($fileError === 0) {
                // Generate unique filename
                $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);
                $newFileName = uniqid('car_') . '.' . $fileExt;
                $fileDestination = $uploadDir . $newFileName;

                // Move uploaded file
                if (move_uploaded_file($fileTmpName, $fileDestination)) {
                    // Insert into database
                    $stmt = $conn->prepare("INSERT INTO car_images (car_id, image_path, is_primary) VALUES (?, ?, ?)");
                    $isPrimary = $i === 0; // First image is primary
                    $stmt->execute([$car_id, $newFileName, $isPrimary]);
                    
                    $response[] = [
                        'success' => true,
                        'filename' => $newFileName,
                        'is_primary' => $isPrimary
                    ];
                }
            }
        }
    }

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 