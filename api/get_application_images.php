<?php
session_start();
ob_start();

require_once 'db_connect.php';

// Set CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$conn = db_connect();

if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

try {
    $applicationId = isset($_GET['applicationId']) ? $_GET['applicationId'] : null;

    if (!$applicationId) {
        throw new Exception('Application ID is required');
    }

    // Get all images for this application with their descriptions
    $stmt = $conn->prepare("
        SELECT
            ai.id,
            ai.application_id,
            ai.image_path,
            ai.image_type,
            CASE
                WHEN ai.image_type = 'car' THEN
                    CASE ai.image_path
                        WHEN 'front.jpg' THEN 'Front View'
                        WHEN 'back.jpg' THEN 'Back View'
                        WHEN 'left.jpg' THEN 'Left Side'
                        WHEN 'right.jpg' THEN 'Right Side'
                        WHEN 'engine.jpg' THEN 'Engine Bay'
                        WHEN 'interior.jpg' THEN 'Interior'
                        ELSE CONCAT('View ', ai.id)
                    END
                WHEN ai.image_type = 'id' THEN 'Valid ID'
                ELSE 'Other'
            END as image_description,
            ai.uploaded_at
        FROM application_images ai
        WHERE ai.application_id = ?
    ");

    $stmt->execute([$applicationId]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Normalize image paths by removing 'uploads/' prefix
    foreach ($images as &$img) {
        if (strpos($img['image_path'], 'uploads/selling_car_photos/') === 0) {
            $img['image_path'] = substr($img['image_path'], strlen('uploads/selling_car_photos/'));
        } else if (strpos($img['image_path'], 'uploads/valid_ID/') === 0) {
            $img['image_path'] = substr($img['image_path'], strlen('uploads/valid_ID/'));
        }
    }
    unset($img); // Break the reference

    // Separate car images and ID images
    $carImages = array_filter($images, function($img) {
        return strtolower($img['image_type']) === 'car';
    });

    $idImages = array_filter($images, function($img) {
        return strtolower($img['image_type']) === 'id';
    });

    // Debug log
    error_log("Raw images from database for application {$applicationId}: " . print_r($images, true));
    error_log("Found ID images: " . print_r($idImages, true));

    // Get the ID image
    $idImage = !empty($idImages) ? current($idImages) : null;
    
    if (!$idImage) {
        error_log("WARNING: No ID image found for application {$applicationId}. This should not happen!");
    }

    ob_clean();
    echo json_encode([
        'success' => true,
        'carImages' => array_values($carImages),
        'idImage' => $idImage,
        'debug' => [
            'totalImages' => count($images),
            'carImagesCount' => count($carImages),
            'hasIdImage' => !empty($idImage)
        ]
    ]);

} catch (Exception $e) {
    ob_clean();
    error_log("Error in get_application_images.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving images',
        'error' => $e->getMessage()
    ]);
}