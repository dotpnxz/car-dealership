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
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_connect.php';

try {
    session_start();

    // Debug session information
    error_log("Full session data: " . print_r($_SESSION, true));
    error_log("Session user_id: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'not set'));
    error_log("Session accountType: " . (isset($_SESSION['accountType']) ? $_SESSION['accountType'] : 'not set'));

    if (!isset($_SESSION['user_id'])) {
        error_log("User not logged in - redirecting to login");
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user_id'];
    $accountType = $_SESSION['accountType'] ?? '';

    // Debug account type
    error_log("Account type from session: " . $accountType);

    $conn = db_connect();

    $sql = "
        SELECT
            rc.id,
            rc.fullname,
            rc.title,
            rc.reservation_date,
            rc.payment_status,
            rc.reservation_type,
            u.username as user_name,
            rc.user_id,
            CASE WHEN lr.id IS NOT NULL THEN TRUE ELSE FALSE END as requirements_submitted,
            c.price as car_price
        FROM reserved_cars rc
        LEFT JOIN users u ON rc.user_id = u.id
        LEFT JOIN loan_requirements lr ON rc.id = lr.reservation_id
        LEFT JOIN cars c ON rc.car_id = c.id
        WHERE ";

    if ($accountType === 'admin' || $accountType === 'staff') {
        $sql .= "1=1";
    } else {
        $sql .= "rc.user_id = :user_id";
    }

    $sql .= " ORDER BY rc.reservation_date DESC";

    $stmt = $conn->prepare($sql);

    if ($accountType !== 'admin' && $accountType !== 'staff') {
        $stmt->bindParam(':user_id', $userId);
    }

    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    error_log("Number of reservations found: " . count($reservations));
    error_log("Reservations data: " . print_r($reservations, true));
    error_log("SQL Query executed: " . $stmt->queryString);

    echo json_encode([
        'success' => true,
        'data' => $reservations,
        'debug' => [
            'user_id' => $userId,
            'account_type' => $accountType,
            'is_admin' => $accountType === 'admin' ? 'Yes' : 'No',
            'total_reservations' => count($reservations),
            'query_executed' => $stmt->queryString,
            'session_data' => $_SESSION
        ]
    ]);

} catch (Exception $e) {
    error_log("Error in get_reservations.php: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
