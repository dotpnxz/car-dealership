<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    $conn = db_connect();
    
    // Alter the loan_requirements table to make car_id nullable
    $sql = "ALTER TABLE loan_requirements MODIFY COLUMN car_id INT NULL";
    $conn->exec($sql);

    echo json_encode([
        'success' => true,
        'message' => 'Table structure updated successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 