<?php
// Enable error reporting for debugging
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

// Start session
session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

require_once __DIR__ . '/db_connect.php';
$conn = db_connect();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }

    $conn->beginTransaction();

    // Handle password change first if provided
    if (!empty($data['oldPassword']) && !empty($data['newPassword'])) {
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($data['oldPassword'], $user['password'])) {
            throw new Exception('Current password is incorrect');
        }

        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([
            password_hash($data['newPassword'], PASSWORD_DEFAULT),
            $_SESSION['user_id']
        ]);
    }

    $sql = "UPDATE users SET 
            surname = ?,
            firstName = ?,
            middleName = ?,
            suffix = ?,
            contactNo = ?,
            gender = ?,
            birthDay = ?,
            birthMonth = ?,
            birthYear = ?,
            streetAddress = ?,
            city = ?,
            province = ?,
            zipCode = ?
            WHERE id = ?";

    $params = [
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
        $_SESSION['user_id']
    ];

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0 && empty($data['oldPassword'])) {
        throw new Exception('No changes made');
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    error_log("Profile update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>