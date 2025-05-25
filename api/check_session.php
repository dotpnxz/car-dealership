<?php
session_start();

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

// Debug log
error_log('Session contents: ' . print_r($_SESSION, true));

if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'authenticated',
        'user_id' => $_SESSION['user_id'],
        'session_id' => session_id()
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'status' => 'not_authenticated',
        'message' => 'No valid session found'
    ]);
}
?>