<?php

// Enable CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Access-Control-Max-Age: 3600");
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

// Add this function after isUsernameTaken function
function isEmailTaken($conn, $email) {
    try {
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        error_log("Email check failed: " . $e->getMessage());
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
        $username = isset($data['username']) ? trim($data['username']) : '';
        $password = isset($data['password']) ? $data['password'] : '';
        $confirmPassword = isset($data['confirmPassword']) ? $data['confirmPassword'] : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $birthDay = isset($data['birthDay']) ? (int)$data['birthDay'] : null;
        $birthMonth = isset($data['birthMonth']) ? (int)$data['birthMonth'] : null;
        $birthYear = isset($data['birthYear']) ? (int)$data['birthYear'] : null;
        $contactNo = isset($data['contactNo']) ? trim($data['contactNo']) : '';
        $gender = isset($data['gender']) ? trim($data['gender']) : '';
        $address = isset($data['address']) ? trim($data['address']) : '';
        $surname = isset($data['surname']) ? trim($data['surname']) : '';
        $firstName = isset($data['firstName']) ? trim($data['firstName']) : '';
        $secondName = isset($data['secondName']) ? trim($data['secondName']) : '';
        $middleName = isset($data['middleName']) ? trim($data['middleName']) : '';
        $streetAddress = isset($data['streetAddress']) ? trim($data['streetAddress']) : '';
        $city = isset($data['city']) ? trim($data['city']) : '';
        $province = isset($data['province']) ? trim($data['province']) : '';
        error_log("Province value: " . $province); // Add this line
        $zipCode = isset($data['zipCode']) ? trim($data['zipCode']) : '';
        $suffix = isset($data['suffix']) ? trim($data['suffix']) : '';
        $accountType = isset($data['accountType']) ? trim($data['accountType']) : '';
        $securityQuestion = isset($data['securityQuestion']) ? trim($data['securityQuestion']) : '';
        $securityAnswer = isset($data['securityAnswer']) ? trim($data['securityAnswer']) : '';
        $errors = [];

        // Validation
        if (empty($surname)) {
            $errors[] = "Surname is required.";
        }
        if (empty($firstName)) {
            $errors[] = "First name is required.";
        }
        if (empty($username)) {
            $errors[] = "Username is required.";
        }
        if (!empty($username) && isUsernameTaken($conn, $username)) {
            $errors[] = "This username is already taken. Please choose another.";
        }
        if (empty($streetAddress)) {
            $errors[] = "Street address is required.";
        }
        if (empty($city)) {
            $errors[] = "City is required.";
        }
        if (empty($province)) {
            $errors[] = "Province is required.";
        }
        if (empty($zipCode)) {
            $errors[] = "ZIP code is required.";
        }

        // Add email validation
        if (empty($email)) {
            $errors[] = "Email address is required.";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format.";
        } elseif (isEmailTaken($conn, $email)) {
            $errors[] = "This email address is already registered.";
        }

        // Debug password values
        error_log("Password: " . $password);
        error_log("Confirm Password: " . $confirmPassword);

        // Update password validation
        if (empty($password)) {
            $errors[] = "Password is required.";
        } elseif (empty($confirmPassword)) {
            $errors[] = "Confirm password is required.";
        } elseif (strcmp($password, $confirmPassword) !== 0) {  // Use strcmp for exact comparison
            $errors[] = "Password do not match.";
        }

        // Account type validation
        $allowedTypes = ['buyer', 'seller'];
        if (!in_array($accountType, $allowedTypes)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid account type. Must be either buyer or seller.'
            ]);
            exit;
        }

        // Security question validation
        if (empty($securityQuestion)) {
            $errors[] = "Security question is required.";
        }
        if (empty($securityAnswer)) {
            $errors[] = "Security answer is required.";
        }

        // If there are validation errors, return them
        if (!empty($errors)) {
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'errors' => $errors
            ]);
            exit;
        }

        if (empty($errors)) {
            // Hash password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            error_log("Attempting to insert user data");

            // Prepare and execute the insert statement
            $stmt = $conn->prepare("
                INSERT INTO users (
                    username,
                    password,
                    email,
                    surname,
                    firstName,
                    secondName,
                    middleName,
                    suffix,
                    birthDay,
                    birthMonth,
                    birthYear,
                    contactNo,
                    gender,
                    streetAddress,
                    city,
                    province,
                    zipCode,
                    accountType,
                    security_question,
                    security_answer
                ) VALUES (
                    :username,
                    :password,
                    :email,
                    :surname,
                    :firstName,
                    :secondName,
                    :middleName,
                    :suffix,
                    :birthDay,
                    :birthMonth,
                    :birthYear,
                    :contactNo,
                    :gender,
                    :streetAddress,
                    :city,
                    :province,
                    :zipCode,
                    :accountType,
                    :security_question,
                    :security_answer
                )
            ");

            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':password', $hashed_password);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':surname', $surname);
            $stmt->bindParam(':firstName', $firstName);
            $stmt->bindParam(':secondName', $secondName);
            $stmt->bindParam(':middleName', $middleName);
            $stmt->bindParam(':suffix', $suffix);
            $stmt->bindParam(':birthDay', $birthDay, PDO::PARAM_INT);
            $stmt->bindParam(':birthMonth', $birthMonth, PDO::PARAM_INT);
            $stmt->bindParam(':birthYear', $birthYear, PDO::PARAM_INT);
            $stmt->bindParam(':contactNo', $contactNo);
            $stmt->bindParam(':gender', $gender);
            $stmt->bindParam(':streetAddress', $streetAddress);
            $stmt->bindParam(':city', $city);
            $stmt->bindParam(':province', $province);
            $stmt->bindParam(':zipCode', $zipCode);
            $stmt->bindParam(':accountType', $accountType);
            $stmt->bindParam(':security_question', $securityQuestion);
            $stmt->bindParam(':security_answer', $securityAnswer);

            $stmt->execute();

            error_log("User data inserted successfully");
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'type' => 'success',
                'message' => 'Registration successful!'
            ]);
        } else {
            error_log("Validation errors: " . implode(", ", $errors));
            http_response_code(400);
            echo json_encode(['success' => false, 'errors' => $errors]);
        }
    } catch (Exception $e) {
        error_log("Error occurred: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
}
?>
