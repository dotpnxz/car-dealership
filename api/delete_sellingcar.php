<?php
session_start();
require_once 'db_connect.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $conn = db_connect();
    
    $data = json_decode(file_get_contents('php://input'));
    $carId = $data->car_id ?? null;
    
    if (!$carId) {
        throw new Exception('Car ID is required');
    }

    // Start transaction
    $conn->beginTransaction();

    try {
        // Delete from application_images first (due to foreign key constraint)
        $stmt = $conn->prepare("DELETE FROM application_images WHERE application_id = ?");
        $stmt->execute([$carId]);

        // Delete from car_images if exists
        $stmt = $conn->prepare("DELETE FROM car_images WHERE car_id = ?");
        $stmt->execute([$carId]);

        // Finally delete the car application record
        $stmt = $conn->prepare("DELETE FROM car_applications WHERE id = ?");
        $stmt->execute([$carId]);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Car application not found or not authorized to delete');
        }

        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Car application deleted successfully'
        ]);
    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        throw $e;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
