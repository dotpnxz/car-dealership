<?php
header('Content-Type: application/json');
require_once 'db_connect.php';
session_start();

try {
    $conn = db_connect();
    
    // Get user_id from session, prioritize GET/POST for specific user view
    $requested_user_id = $_GET['user_id'] ?? $_POST['user_id'] ?? null;
    $session_user_id = $_SESSION['user_id'] ?? null;
    $accountType = $_SESSION['accountType'] ?? '';

    // Get optional reservation_id
    $reservation_id = $_GET['reservation_id'] ?? $_POST['reservation_id'] ?? null;

    // Determine if the user is authorized to view all requirements
    $can_view_all = ($accountType === 'admin' || $accountType === 'staff');

    // If no specific user_id is requested and the user cannot view all, use session user_id
    $target_user_id = $requested_user_id;
    if (!$target_user_id && !$can_view_all) {
        $target_user_id = $session_user_id;
    }

    // If after determining target_user_id, it's still null and they can't view all, unauthorized
    if (!$target_user_id && !$can_view_all && !$reservation_id) {
         throw new Exception('User not logged in or authorized to view requirements');
    }

    $sql = "SELECT id, reservation_id, car_id, name, car_title, date_submitted, car_loan_status FROM loan_requirements";
    $params = [];
    $where_clauses = [];

    // Add WHERE clause for user_id if viewing a specific user's requirements
    if ($target_user_id) {
        $where_clauses[] = "user_id = ?";
        $params[] = $target_user_id;
    }

    // Add WHERE clause for reservation_id if provided
    if ($reservation_id) {
        $where_clauses[] = "reservation_id = ?";
        $params[] = $reservation_id;
    }
    
    // Combine where clauses
    if (!empty($where_clauses)) {
        $sql .= " WHERE " . implode(" AND ", $where_clauses);
    }

    $sql .= " ORDER BY date_submitted DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $requirements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($requirements, JSON_UNESCAPED_UNICODE);
    exit();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
    exit();
} 