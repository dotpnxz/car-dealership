<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require 'db_connect.php';

try {
    $stmt = $conn->prepare("SELECT id, username, accountType FROM users WHERE accountType = 'admin'");
    $stmt->execute();
    $result = $stmt->get_result();
    $admin = $result->fetch_assoc();

    if ($admin) {
        echo json_encode([
            'exists' => true,
            'admin' => $admin
        ]);
    } else {
        echo json_encode([
            'exists' => false,
            'message' => 'No admin account found'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?> 