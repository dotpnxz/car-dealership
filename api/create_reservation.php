<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db_connect.php';

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['car_id']) || !isset($data['user_id']) || !isset($data['title'])) {
        throw new Exception('Missing required fields');
    }

    $carId = $data['car_id'];
    $userId = $data['user_id'];
    $title = $data['title'];

    // Get database connection
    $conn = db_connect();
    
    // Check if we're using the correct database
    $dbName = $conn->query("SELECT DATABASE()")->fetchColumn();
    error_log("Using database: " . $dbName);
    
    // Check if the table exists
    $tableCheck = $conn->prepare("
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? 
        AND table_name = 'reserved_cars'
    ");
    $tableCheck->execute([$dbName]);
    $tableExists = $tableCheck->fetch(PDO::FETCH_ASSOC)['count'] > 0;
    error_log("Table exists check: " . ($tableExists ? 'Yes' : 'No'));
    
    if (!$tableExists) {
        throw new Exception('Reservations table not found in database: ' . $dbName);
    }

    // Get user details
    $stmt = $conn->prepare("SELECT fullname, contactNo, address FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found');
    }

    // Insert reservation
    $stmt = $conn->prepare("
        INSERT INTO reserved_cars (
            car_id, 
            user_id, 
            title,
            fullname, 
            contactNo, 
            address, 
            status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    ");

    $stmt->execute([
        $carId,
        $userId,
        $title,
        $user['fullname'],
        $user['contactNo'],
        $user['address']
    ]);

    // Log the successful insertion
    error_log("Reservation created successfully for user {$userId} and car {$carId}");
    error_log("Last inserted ID: " . $conn->lastInsertId());

    echo json_encode([
        'success' => true,
        'message' => 'R                                                                 ',
        'debug' => [
            'database' => $dbName,
            'table_exists' => $tableExists ? 'Yes' : 'No',
            'user_id' => $userId,
            'car_id' => $carId
        ]
    ]);

} catch (Exception $e) {
    error_log("Error in create_reservation.php: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 