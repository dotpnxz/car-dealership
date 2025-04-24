<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set session cookie parameters before starting the session
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
ini_set('session.cookie_samesite', 'Lax');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

try {
    $servername = "localhost";
    $username = "root";
    $password = "admin";
    $dbname = "accounts_user";

    // Debug: Log connection attempt
    error_log("Attempting to connect to database: $dbname");

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Debug: Log successful connection
    error_log("Database connection successful");

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
    $_SESSION['fullname'] = $user['fullname'];

    // Debug: Log session data
    error_log("Login successful. Session data: " . print_r($_SESSION, true));

    // Ensure session is written
    session_write_close();

    echo json_encode([
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'fullname' => $user['fullname'],
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