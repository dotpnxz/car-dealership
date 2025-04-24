<?php

// Enable CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start output buffering
ob_start();

// Enable error logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');
error_reporting(E_ALL);

try {
    require 'db_connect.php';
    $conn = db_connect();
    error_log("Database connection successful");
} catch (Exception $e) {
    error_log("Database connection failed: " . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

function isUsernameTaken($conn, $username) {
    try {
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        error_log("Username check failed: " . $e->getMessage());
        return false;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get raw POST data
        $json_data = file_get_contents('php://input');
        error_log("Raw POST data: " . $json_data);
        
        if ($json_data === false) {
            throw new Exception('Failed to read input data');
        }

        // Decode JSON data
        $data = json_decode($json_data, true);
        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data received: ' . json_last_error_msg());
        }

        error_log("Decoded data: " . print_r($data, true));

        // Validate and sanitize input
        $fullname = isset($data['fullname']) ? trim($data['fullname']) : '';
        $username = isset($data['username']) ? trim($data['username']) : '';
        $password = isset($data['password']) ? $data['password'] : '';
        $birthDay = isset($data['birthDay']) ? (int)$data['birthDay'] : null;
        $birthMonth = isset($data['birthMonth']) ? (int)$data['birthMonth'] : null;
        $birthYear = isset($data['birthYear']) ? (int)$data['birthYear'] : null;
        $contactNo = isset($data['contactNo']) ? trim($data['contactNo']) : '';
        $gender = isset($data['gender']) ? trim($data['gender']) : '';
        $address = isset($data['address']) ? trim($data['address']) : '';

        $errors = [];

        // Validation
        if (empty($fullname)) {
            $errors[] = "Name is required.";
        }
        if (empty($username)) {
            $errors[] = "Username is required.";
        }
        if (!empty($username) && isUsernameTaken($conn, $username)) {
            $errors[] = "This username is already taken. Please choose another.";
        }
        if (empty($password)) {
            $errors[] = "Password is required.";
        }

        if (empty($errors)) {
            // Hash password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            error_log("Attempting to insert user data");

            // Prepare and execute the insert statement
            $stmt = $conn->prepare("INSERT INTO users (fullname, username, password, birthDay, birthMonth, birthYear, contactNo, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            try {
                $result = $stmt->execute([
                    $fullname,
                    $username,
                    $hashed_password,
                    $birthDay,
                    $birthMonth,
                    $birthYear,
                    $contactNo,
                    $gender,
                    $address
                ]);

                if ($result) {
                    error_log("User registration successful");
                    ob_clean();
                    echo json_encode(['success' => true, 'message' => 'Registration successful!']);
                } else {
                    error_log("Failed to insert user data: " . print_r($stmt->errorInfo(), true));
                    throw new Exception('Failed to insert user data');
                }
            } catch (PDOException $e) {
                error_log("PDO Error during insert: " . $e->getMessage());
                throw new Exception('Database error during registration: ' . $e->getMessage());
            }
        } else {
            error_log("Validation errors: " . print_r($errors, true));
            ob_clean();
            echo json_encode(['success' => false, 'message' => 'Please correct the following errors:', 'errors' => $errors]);
        }
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'An error occurred during registration: ' . $e->getMessage()]);
    }
} else {
    error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    ob_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

// Close the connection
$conn = null;
?>