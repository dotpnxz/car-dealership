<?php
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

// Set CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Check authentication
if (!isset($_SESSION['user_id']) || $_SESSION['accountType'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

require_once __DIR__ . '/db_connect.php';
$conn = db_connect();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        throw new Exception('User ID is required');
    }

    $conn->beginTransaction();

    $sql = "UPDATE users SET 
            username = ?,
            surname = ?,
            firstName = ?,
            secondName = ?,
            middleName = ?,
            contactNo = ?,
            gender = ?,
            birthDay = ?,
            birthMonth = ?,
            birthYear = ?,
            streetAddress = ?,
            city = ?,
            province = ?,
            zipCode = ?,
            accountType = ?,
            suffix = ?";

    $params = [
        $data['username'],
        $data['surname'],
        $data['firstName'],
        $data['secondName'],
        $data['middleName'],
        $data['contactNo'],
        $data['gender'],
        $data['birthDay'],
        $data['birthMonth'],
        $data['birthYear'],
        $data['streetAddress'],
        $data['city'],
        $data['province'],
        $data['zipCode'],
        $data['accountType'],
        $data['suffix']
    ];

    // Add password update if provided
    if (!empty($data['password'])) {
        $sql .= ", password = ?";
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }

    $sql .= " WHERE id = ?";
    $params[] = $data['id'];

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        throw new Exception('No changes made or user not found');
    }

    $conn->commit();
    echo json_encode(['message' => 'User updated successfully']);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    error_log("Update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>