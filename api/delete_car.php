<?php
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
    $data = json_decode(file_get_contents('php://input'), true);
    $carId = $data['carId'] ?? null;

    // Validate car ID
    if (empty($carId)) {
        throw new Exception('Car ID is required');
    }

    if (!is_numeric($carId)) {
        throw new Exception('Invalid car ID');
    }

    // Start transaction
    $conn->beginTransaction();

    try {
        // First, delete associated images from the filesystem and database
        $stmt = $conn->prepare("SELECT image_path FROM car_images WHERE car_id = :carId");
        $stmt->bindParam(':carId', $carId, PDO::PARAM_INT);
        $stmt->execute();
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Delete images from filesystem
        foreach ($images as $image) {
            $imagePath = '../' . $image['image_path'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        // Delete images from database
        $stmt = $conn->prepare("DELETE FROM car_images WHERE car_id = :carId");
        $stmt->bindParam(':carId', $carId, PDO::PARAM_INT);
        $stmt->execute();

        // Delete the car
        $stmt = $conn->prepare("DELETE FROM cars WHERE id = :carId");
        $stmt->bindParam(':carId', $carId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new Exception('Car not found or already deleted');
        }

        // Commit transaction
        $conn->commit();

        // Clear output buffer
        ob_clean();
        
        echo json_encode([
            'success' => true,
            'message' => 'Car and associated images deleted successfully'
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollBack();
        throw $e;
    }

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
} finally {
    if (isset($stmt)) {
        $stmt = null;
    }
    if (isset($conn)) {
        $conn = null;
    }
}