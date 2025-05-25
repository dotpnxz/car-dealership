<?php
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
    error_log("Received data: " . print_r($data, true));
    
    if (!isset($data['car_id']) || !isset($data['user_id']) || !isset($data['title'])) {
        throw new Exception('Missing required fields');
    }

    $carId = $data['car_id'];
    $userId = $data['user_id'];
    $title = $data['title'];

    $conn = db_connect();
    
    // Check if the car is already reserved (has a paid reservation)
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM reserved_cars WHERE car_id = ? AND payment_status = 'paid'");
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

    // Check if user already has a pending/paid reservation for THIS specific car
    $userCheckStmt = $conn->prepare("SELECT COUNT(*) FROM reserved_cars WHERE car_id = ? AND user_id = ? AND payment_status IN ('pending', 'paid')");
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

    // Get user details
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
            payment_status
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

    $reservationId = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Reservation created successfully',
        'reservation_id' => $reservationId,
        'debug' => [
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