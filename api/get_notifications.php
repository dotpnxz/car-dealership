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

session_start();
require_once 'db_connect.php';

try {
    $user_id = $_SESSION['user_id'];
    $conn = db_connect();
    
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM notifications 
        WHERE user_id = ? AND is_read = FALSE");
    $stmt->execute([$user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'count' => $result['count']
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
