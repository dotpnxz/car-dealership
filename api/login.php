<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set session cookie parameters before starting the session
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
ini_set('session.cookie_samesite', 'Lax');

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
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session with custom parameters
session_name('PHPSESSID');
session_start([
    'cookie_lifetime' => 86400, // 24 hours
    'cookie_httponly' => true,
    'cookie_secure' => false, // Set to true if using HTTPS
    'cookie_samesite' => 'Lax'
]);

// Check if this is just a session verification request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['user_id']) && isset($_SESSION['accountType'])) {
        echo json_encode([
            'success' => true,
            'isLoggedIn' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'accountType' => $_SESSION['accountType']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'isLoggedIn' => false
        ]);
    }
    exit();
}

// Use db_connect.php for environment-aware DB connection
require_once __DIR__ . '/db_connect.php';

try {
    $conn = db_connect();

    $data = json_decode(file_get_contents('php://input'), true);

    // Debug: Log received data
    error_log("Received login data: " . print_r($data, true));

    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
        exit();
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$data['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Debug: Log user lookup result
    error_log("User lookup result: " . ($user ? "Found user" : "User not found"));

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
        exit();
    }

    // Debug: Log password verification attempt
    error_log("Attempting password verification for user: " . $user['username']);

    if (!password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
        exit();
    }

    // Clear any existing session data
    session_unset();
    
    // Set session data
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['accountType'] = $user['accountType'];
    $_SESSION['is_admin'] = ($user['accountType'] === 'admin');

    // Debug: Log session data
    error_log("Login successful. Session data: " . print_r($_SESSION, true));

    // Ensure session is written
    session_write_close();

    echo json_encode([
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'accountType' => $user['accountType']
        ]
    ]);
} catch(PDOException $e) {
    // Debug: Log database error
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch(Exception $e) {
    // Debug: Log general error
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
}
?>