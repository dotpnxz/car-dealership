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

// Start the session to access user information
session_start();

// Check if the user is logged in
if (isset($_SESSION['user_id'])) {
    $loggedInUserId = $_SESSION['user_id'];

    try {
        require 'db_connect.php';
        $conn = db_connect();
        
        // Prepare SQL statement
        $sql = "SELECT 
                    id,
                    surname, firstName, middleName, suffix,
                    username, email, contactNo, gender,
                    birthDay, birthMonth, birthYear,
                    streetAddress, province, city, zipCode
                FROM users 
                WHERE id = :user_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_id', $loggedInUserId);
        $stmt->execute();
        
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($userData) {
            // Clear any previous output
            ob_clean();
            // We should NOT send the password back to the frontend
            unset($userData['password']);
            echo json_encode($userData, JSON_UNESCAPED_UNICODE);
            exit();
        } else {
            // Clear any previous output
            ob_clean();
            http_response_code(404);
            echo json_encode(['error' => 'Profile not found'], JSON_UNESCAPED_UNICODE);
            exit();
        }

    } catch (PDOException $e) {
        // Clear any previous output
        ob_clean();
        error_log("Profile error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit();
    }

} else {
    // Clear any previous output
    ob_clean();
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in'], JSON_UNESCAPED_UNICODE);
    exit();
}

// End output buffering and send output
ob_end_flush();

?>