<?php
// Test script for user management endpoints
header('Content-Type: application/json');

try {
    // Database connection
    $servername = "localhost";
    $username = "root";
    $password = "admin";  // Updated password
    $dbname = "car_dealership";

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Test 1: Check if admin user exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = 'admin'");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Admin user exists',
            'admin_details' => [
                'id' => $admin['id'],
                'username' => $admin['username'],
                'accountType' => $admin['accountType']
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Admin user not found'
        ]);
    }

} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 