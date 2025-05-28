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
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Include database connection
require 'db_connect.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user_id'];
    $conn = db_connect();

    // Get all purchases for the user
    $stmt = $conn->prepare("
        SELECT *
        FROM purchases
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    
    $stmt->execute([$userId]);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $purchases = [];
    foreach ($result as $row) {
        $purchases[] = [
            'id' => $row['id'],
            'car_id' => $row['car_id'],
            'user_id' => $row['user_id'],
            'title' => $row['title'],
            'purchase_type' => $row['purchase_type'],
            'amount' => $row['amount'],
            'payment_status' => $row['payment_status'],
            'payment_date' => $row['payment_date'],
            'payment_reference' => $row['payment_reference'],
            'purchase_date' => $row['purchase_date'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }

    echo json_encode([
        'success' => true,
        'purchases' => $purchases
    ]);

} catch (Exception $e) {
    error_log("Error in get_purchases.php: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 