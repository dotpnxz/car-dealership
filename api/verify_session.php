<?php
// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering
ob_start();

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Set session cookie parameters
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
    ini_set('session.cookie_samesite', 'Lax');

    // Start session with custom parameters
    session_name('PHPSESSID');
    session_start([
        'cookie_lifetime' => 0, // Session cookie will expire when browser closes
        'cookie_httponly' => true,
        'cookie_secure' => false, // Set to true if using HTTPS
        'cookie_samesite' => 'Lax'
    ]);

    // Check if user is logged in
    if (isset($_SESSION['user_id'])) {
        // Clear any previous output
        ob_clean();
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'accountType' => $_SESSION['accountType'] ?? 'user'
            ]
        ]);
        exit();
    } else {
        // Clear any previous output
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'No active session'
        ]);
        exit();
    }
} catch (Exception $e) {
    // Clear any previous output
    ob_clean();
    error_log("Session verification error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while verifying session'
    ]);
    exit();
}
?> 