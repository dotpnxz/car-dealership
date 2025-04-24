<?php
header('Content-Type: application/json');

require_once 'db_connect.php';

try {
    // Check if cars table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'cars'");
    if ($stmt->rowCount() === 0) {
        // Create cars table
        $sql = "CREATE TABLE cars (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            category VARCHAR(50) NOT NULL,
            brand VARCHAR(50) NOT NULL,
            variant VARCHAR(100) NOT NULL,
            mileage INT NOT NULL,
            transmission VARCHAR(50) NOT NULL,
            `condition` VARCHAR(50) NOT NULL,
            seating INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $conn->exec($sql);
        echo json_encode([
            'status' => 'success',
            'message' => 'Cars table created successfully'
        ]);
    } else {
        echo json_encode([
            'status' => 'info',
            'message' => 'Cars table already exists'
        ]);
    }

} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} 