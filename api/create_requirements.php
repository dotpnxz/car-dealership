<?php
header('Content-Type: application/json');
require_once 'db_connect.php';
session_start();

try {
    $conn = db_connect();
    $data = $_POST;
    // Accept JSON as well
    if (empty($data)) {
        $data = json_decode(file_get_contents('php://input'), true);
    }

    $reservation_id = $data['reservation_id'] ?? null;
    $user_id = $data['user_id'] ?? ($_SESSION['user_id'] ?? null);
    $name = $data['name'] ?? null;
    $car_title = $data['car_title'] ?? null;
    $car_loan_status = $data['car_loan_status'] ?? 'under review';

    if (!$reservation_id || !$user_id || !$name || !$car_title) {
        throw new Exception('Missing required fields');
    }

    // Get car_id from the reserved_cars table
    $stmt = $conn->prepare("SELECT car_id FROM reserved_cars WHERE id = ?");
    $stmt->execute([$reservation_id]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$reservation || !$reservation['car_id']) {
        throw new Exception('Could not find car_id for this reservation');
    }

    $car_id = $reservation['car_id'];

    // Log the data for debugging
    error_log("Reservation ID: " . $reservation_id);
    error_log("Car ID: " . $car_id);
    error_log("User ID: " . $user_id);
    error_log("Name: " . $name);
    error_log("Car Title: " . $car_title);

    $stmt = $conn->prepare("INSERT INTO loan_requirements (reservation_id, user_id, car_id, name, car_title, car_loan_status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$reservation_id, $user_id, $car_id, $name, $car_title, $car_loan_status]);
    $loan_requirement_id = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'loan_requirement_id' => $loan_requirement_id
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 