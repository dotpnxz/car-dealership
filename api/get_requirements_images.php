<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    $conn = db_connect();
    $loan_requirement_id = $_GET['loan_requirement_id'] ?? $_POST['loan_requirement_id'] ?? null;
    if (!$loan_requirement_id) {
        throw new Exception('Missing loan_requirement_id');
    }
    $stmt = $conn->prepare("SELECT id, requirement_type, file_path, uploaded_at FROM requirements_images WHERE loan_requirement_id = ?");
    $stmt->execute([$loan_requirement_id]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode([
        'success' => true,
        'images' => $images
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 