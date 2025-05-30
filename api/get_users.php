<?php
// Start output buffering
ob_start();

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
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['accountType'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    // Update SQL statement to use combined fields
    $sql = "SELECT 
        id, 
        username, 
        CONCAT(surname, ' ', firstName,
            CASE WHEN suffix IS NOT NULL AND suffix != '' THEN CONCAT(' ', suffix) ELSE '' END,
            CASE WHEN middleName IS NOT NULL AND middleName != '' THEN CONCAT(' ', middleName) ELSE '' END
        ) as fullname,
        contactNo,
        gender,
        birthDay,
        birthMonth,
        birthYear,
        streetAddress,
        city,
        province,
        zipCode,
        suffix,
        CONCAT(
            streetAddress, ', ', 
            city, ', ', 
            province, ', ',
            zipCode
        ) as address,
        accountType 
    FROM users";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Clear any previous output
    ob_clean();
    echo json_encode($users, JSON_UNESCAPED_UNICODE);
    exit();

} catch (PDOException $e) {
    // Clear any previous output
    ob_clean();
    error_log("User management error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit();
}
?>