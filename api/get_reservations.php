<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db_connect.php';

try {
    session_start();

    // Debug session information
    error_log("Full session data: " . print_r($_SESSION, true));
    error_log("Session user_id: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'not set'));
    error_log("Session accountType: " . (isset($_SESSION['accountType']) ? $_SESSION['accountType'] : 'not set')); // Use the correct variable name

    if (!isset($_SESSION['user_id'])) {
        error_log("User not logged in - redirecting to login");
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user_id'];
    $accountType = $_SESSION['accountType'] ?? ''; // Use the correct variable name and handle potential unset

    // Debug account type
    error_log("Account type from session: " . $accountType);

    $conn = db_connect();

    $sql = "
        SELECT
            rc.id,
            rc.fullname,
            rc.title,
            rc.reservation_date,
            rc.status,
            u.username as user_name,
            rc.user_id
        FROM reserved_cars rc
        LEFT JOIN users u ON rc.user_id = u.id
        WHERE ";

    if ($accountType === 'admin') {
        $sql .= "1=1"; // Admin sees all
    } else {
        $sql .= "rc.user_id = :user_id"; // Regular users see their own
    }

    $sql .= " ORDER BY rc.reservation_date DESC";

    $stmt = $conn->prepare($sql);

    // Bind parameter only if not admin
    if ($accountType !== 'admin') {
        $stmt->bindParam(':user_id', $userId);
    }

    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Debug information
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
