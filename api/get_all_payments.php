<?php
ob_start();

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

try {
    // Debug session information
    error_log("Full session data (payments): " . print_r($_SESSION, true));
    error_log("Session user_id (payments): " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'not set'));
    error_log("Session accountType (payments): " . (isset($_SESSION['accountType']) ? $_SESSION['accountType'] : 'not set'));

    if (!isset($_SESSION['user_id']) || !isset($_SESSION['accountType']) ||
        ($_SESSION['accountType'] !== 'admin' && $_SESSION['accountType'] !== 'staff')) {
        error_log("Unauthorized access to get_all_payments.php");
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $accountType = $_SESSION['accountType'];
    error_log("Account type from session (payments): " . $accountType);

    $conn = db_connect();    $sql = "
        SELECT
            rc.id,
            c.title AS car_title,
            COALESCE(rc.payment_amount, 0) AS amount,
            COALESCE(rc.updated_at, rc.reservation_date) AS created_at,
            COALESCE(rc.payment_status, 'pending') AS status,
            COALESCE(rc.payment_reference, '') as payment_reference,
            u.surname,
            u.firstName,
            COALESCE(u.middleName, '') as middleName,
            COALESCE(u.suffix, '') as suffix,
            u.username AS user_name,
            u.id AS user_id,
            rc.fullname
        FROM reserved_cars rc
        LEFT JOIN cars c ON rc.car_id = c.id
        LEFT JOIN users u ON rc.user_id = u.id
        WHERE rc.payment_status IS NOT NULL
        ORDER BY rc.updated_at DESC, rc.reservation_date DESC
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        error_log("PDO Prepare Error (get_all_payments): " . print_r($conn->errorInfo(), true) . ". Query: " . $sql);
        throw new Exception("Database prepare error");
    }

    $stmt->execute();
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'payments' => $payments,
        'debug' => [
            'account_type' => $accountType,
            'total_payments' => count($payments)
        ]
    ]);

} catch (PDOException $e) {
    error_log("Error in get_all_payments.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn = null;
    }
    ob_end_flush();
}
?>