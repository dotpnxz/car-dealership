<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start output buffering
ob_start();

// Start session
session_start();

// Enable CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'User not logged in'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $userId = $_SESSION['user_id'];
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Sanitize input data
        $fullname = filter_var($data['fullname'] ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $username = filter_var($data['username'] ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $birthDay = filter_var($data['birthDay'] ?? null, FILTER_SANITIZE_NUMBER_INT);
        $birthMonth = filter_var($data['birthMonth'] ?? null, FILTER_SANITIZE_NUMBER_INT);
        $birthYear = filter_var($data['birthYear'] ?? null, FILTER_SANITIZE_NUMBER_INT);
        $contactNo = filter_var($data['contactNo'] ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $gender = filter_var($data['gender'] ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $address = filter_var($data['address'] ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

        // Check if username is already taken by another user
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = :username AND id != :userId");
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Username already taken'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Update user profile
        $stmt = $conn->prepare("UPDATE users SET 
            fullname = :fullname, 
            username = :username, 
            birthDay = :birthDay, 
            birthMonth = :birthMonth, 
            birthYear = :birthYear, 
            contactNo = :contactNo, 
            gender = :gender, 
            address = :address 
            WHERE id = :userId");

        $stmt->bindParam(':fullname', $fullname, PDO::PARAM_STR);
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->bindParam(':birthDay', $birthDay, PDO::PARAM_INT);
        $stmt->bindParam(':birthMonth', $birthMonth, PDO::PARAM_INT);
        $stmt->bindParam(':birthYear', $birthYear, PDO::PARAM_INT);
        $stmt->bindParam(':contactNo', $contactNo, PDO::PARAM_STR);
        $stmt->bindParam(':gender', $gender, PDO::PARAM_STR);
        $stmt->bindParam(':address', $address, PDO::PARAM_STR);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);

        if ($stmt->execute()) {
            // Clear any previous output
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully'], JSON_UNESCAPED_UNICODE);
            exit();
        } else {
            http_response_code(500);
            // Clear any previous output
            ob_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to update profile'], JSON_UNESCAPED_UNICODE);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(500);
        // Clear any previous output
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'An error occurred while updating profile'], JSON_UNESCAPED_UNICODE);
        exit();
    }
} else {
    http_response_code(405);
    // Clear any previous output
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit();
}

// End output buffering and send output
ob_end_flush();

$conn->close();
?> 