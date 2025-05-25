<?php
// Start output buffering
ob_start();

function db_connect() {
    try {
        // Detect environment by host
        if (isset($_SERVER['HTTP_HOST']) && ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1')) {
            // Local XAMPP
            $servername = "localhost";
            $username = "root";
            $password = "admin";
            $dbname = "accounts_user";
        } else {
            // Hostinger live
            $servername = "localhost"; // Hostinger uses localhost for MySQL
            $username = "u586748329_admin";
            $password = "MjAdmin123";
            $dbname = "u586748329_mjdb";
        }

        // Log connection attempt
        error_log("Attempting database connection to: $dbname");

        $dsn = "mysql:host=$servername;dbname=$dbname;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];

        $conn = new PDO($dsn, $username, $password, $options);
        error_log("Database connection successful");
        return $conn;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        error_log("Error code: " . $e->getCode());
        return null;
    }
}

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
?>