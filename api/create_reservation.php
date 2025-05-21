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
    
    if (!$tableExists) {
        // Create the table if it doesn't exist
        $conn->exec("
            CREATE TABLE IF NOT EXISTS reserved_cars (
                id INT AUTO_INCREMENT PRIMARY KEY,
                car_id INT NOT NULL,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                fullname VARCHAR(255),
                contactNo VARCHAR(50),
                address TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
        error_log("Created reserved_cars table");
    }

    // Check if the car is already reserved
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM reserved_cars WHERE car_id = ? AND status = 'Reserved'");
    $checkStmt->execute([$carId]);
    $reservationCount = $checkStmt->fetchColumn();

    if ($reservationCount > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'This car is already reserved.'
        ]);
        exit;
    }

    // Check if user already has a pending/confirmed reservation for THIS specific car
    $userCheckStmt = $conn->prepare("SELECT COUNT(*) FROM reserved_cars WHERE car_id = ? AND user_id = ? AND (status = 'pending' OR status = 'Reserved')");
    $userCheckStmt->execute([$carId, $userId]);
    $userReservationCount = $userCheckStmt->fetchColumn();

    if ($userReservationCount > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'You already have a reservation for this car.'
        ]);
        exit;
    }

    // Get user details with concatenated name and address
    $stmt = $conn->prepare("
        SELECT 
            TRIM(CONCAT_WS(' ',
                COALESCE(surname, ''),
                COALESCE(firstName, ''),
                COALESCE(middleName, ''),
                COALESCE(suffix, '')
            )) as fullname,
            contactNo,
            TRIM(CONCAT_WS(', ',
                COALESCE(streetAddress, ''),
                COALESCE(city, ''),
                COALESCE(province, ''),
                COALESCE(zipCode, '')
            )) as address
        FROM users 
        WHERE id = ?");
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

    // Don't update car status until admin approves
    // Remove or comment out the following lines:
    // $updateStmt = $conn->prepare("UPDATE cars SET status = 'reserved' WHERE id = ?");
    // $updateStmt->execute([$carId]);

    echo json_encode([
        'success' => true,
        'message' => 'Reservation created successfully',
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
?>