<?php
header('Content-Type: application/json');

require_once 'db_connect.php';

try {
    // Check if cars table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'cars'");
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Cars table does not exist'
        ]);
        exit();
    }

    // Get table structure
    $stmt = $conn->query("DESCRIBE cars");
    $structure = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get all cars
    $stmt = $conn->query("SELECT * FROM cars");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'structure' => $structure,
        'cars' => $cars
    ], JSON_PRETTY_PRINT);

} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
} 