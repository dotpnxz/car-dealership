<?php
// Set CORS headers
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

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Include database connection
require_once __DIR__ . '/db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Received raw data: " . file_get_contents('php://input'));
    error_log("Decoded data: " . print_r($data, true));

    if (!isset($data['carId'])) {
        throw new Exception('Missing required fields: carId');
    }

    $carId = $data['carId'];
    $userId = $_SESSION['user_id'] ?? null;

    if (!$userId) {
        throw new Exception('User not logged in');
    }

    $conn = db_connect();
    
    // Check if the car is already purchased (has a paid purchase)
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM purchases WHERE car_id = ? AND payment_status = 'paid'");
    $checkStmt->execute([$carId]);
    $purchaseCount = $checkStmt->fetchColumn();

    if ($purchaseCount > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'This car is already purchased.'
        ]);
        exit;
    }

    // Check if user already has a pending/paid purchase for THIS specific car
    $userCheckStmt = $conn->prepare("SELECT COUNT(*) FROM purchases WHERE car_id = ? AND user_id = ? AND payment_status IN ('pending', 'paid')");
    $userCheckStmt->execute([$carId, $userId]);
    $userPurchaseCount = $userCheckStmt->fetchColumn();

    if ($userPurchaseCount > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'You already have a purchase for this car.'
        ]);
        exit;
    }

    // Get car details
    $stmt = $conn->prepare("SELECT price, title FROM cars WHERE id = ?");
    $stmt->execute([$carId]);
    $car = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$car) {
        throw new Exception('Car not found');
    }

    // Create purchase record
    $stmt = $conn->prepare("
        INSERT INTO purchases (
            car_id,
            user_id,
            title,
            purchase_type,
            payment_amount,
            payment_status,
            purchase_date
        ) VALUES (?, ?, ?, 'full', ?, 'pending', NOW())
    ");

    $stmt->execute([
        $carId,
        $userId,
        $car['title'],
        $car['price']
    ]);

    $purchase_id = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Purchase created successfully',
        'purchase_id' => $purchase_id,
        'debug' => [
            'user_id' => $userId,
            'car_id' => $carId
        ]
    ]);

} catch (Exception $e) {
    error_log("Error in create_purchase.php: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 