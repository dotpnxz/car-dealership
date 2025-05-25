<?php
// Prevent any output before headers
ob_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/payment_errors.log');

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
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];

$conn = db_connect();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    error_log("Database connection failed in get_payments.php");
    exit();
}

try {
    $query = "SELECT
                rc.id,
                c.title,
                rc.payment_amount,
                rc.updated_at,
                rc.payment_status
              FROM reserved_cars rc
              JOIN cars c ON rc.car_id = c.id
              WHERE rc.user_id = :user_id
              AND rc.payment_status = 'paid'
              ORDER BY rc.updated_at DESC";

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        error_log("PDO Prepare Error: " . print_r($conn->errorInfo(), true) . ". Query: " . $query);
        throw new Exception("Database prepare error");
    }

    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);

    if (!$stmt->execute()) {
        error_log("PDO Execute Error: " . print_r($stmt->errorInfo(), true) . ". User ID: " . $user_id);
        throw new Exception("Query execution error");
    }

    $payments = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payments[] = [
            'car_title' => htmlspecialchars($row['title']),
            'amount' => floatval($row['payment_amount']),
            'created_at' => $row['updated_at'],
            'status' => $row['payment_status']
        ];
    }

    // Clear any previous output and send response
    ob_clean();

    echo json_encode([
        'success' => true,
        'payments' => $payments,
        'debug' => [
            'user_id' => $user_id,
            'row_count' => count($payments)
        ]
    ]);

} catch (PDOException $e) {
    ob_clean();
    error_log("Payment History PDO Error - Message: " . $e->getMessage());
    error_log("Payment History PDO Error - Code: " . $e->getCode());
    error_log("Payment History PDO Error - User ID: " . ($user_id ?? 'not set'));

    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred while retrieving payment history',
        'debug' => [
            'message' => $e->getMessage(),
            'code' => $e->getCode(),
            'user_id' => $user_id ?? 'not set'
        ]
    ]);
} finally {
    // Close PDO connection by setting it to null
    $conn = null;
    // End output buffer
    ob_end_flush();
}
?>