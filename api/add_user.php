<?php
// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once 'db_connect.php';
    $conn = db_connect();

    // Get POST data
    $input = file_get_contents('php://input');
    error_log("Received input: " . $input);

    $data = json_decode($input, true);
    if (!$data) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }

    // Insert user logic here
    $password = bin2hex(random_bytes(4));
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("
        INSERT INTO users (
            username, password, 
            surname, firstName, middleName, suffix,
            contactNo, gender, 
            birthDay, birthMonth, birthYear,
            streetAddress, city, province, zipCode,
            accountType
        ) VALUES (
            ?, ?, 
            ?, ?, ?, ?,
            ?, ?, 
            ?, ?, ?,
            ?, ?, ?, ?,
            ?
        )
    ");
    
    $stmt->execute([
        $data['username'],
        $hashedPassword,
        $data['surname'],
        $data['firstName'],
        $data['middleName'],
        $data['suffix'],
        $data['contactNo'],
        $data['gender'],
        $data['birthDay'],
        $data['birthMonth'],
        $data['birthYear'],
        $data['streetAddress'],
        $data['city'],
        $data['province'],
        $data['zipCode'],
        $data['accountType']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'User added successfully',
        'password' => $password
    ]);

} catch (Exception $e) {
    error_log("Error in add_user.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>