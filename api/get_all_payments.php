<?php
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

    $conn = db_connect();

    $sql = "
        SELECT
            rc.id,
            c.title AS car_title,
            rc.payment_amount AS amount,
            rc.updated_at AS created_at,
            rc.payment_status AS status,
            u.surname,
            u.firstName,
            u.secondName,
            u.middleName,
            u.suffix,
            u.username AS user_name,
            u.id AS user_id
        FROM reserved_cars rc
        JOIN cars c ON rc.car_id = c.id
        JOIN users u ON rc.user_id = u.id
        WHERE rc.payment_status IN ('paid', 'refund_requested', 'refunded')
        ORDER BY rc.updated_at DESC
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