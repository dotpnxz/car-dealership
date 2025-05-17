<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require 'db_connect.php';
    $conn = db_connect();

    if (!isset($_POST['text']) || empty($_POST['text'])) {
        throw new Exception("Announcement text is required");
    }

    // Insert announcement
    $stmt = $conn->prepare("INSERT INTO announcements (text) VALUES (:text)");
    $stmt->execute([':text' => $_POST['text']]);
    $announcement_id = $conn->lastInsertId();

    // Handle image uploads
    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
        $upload_dir = '../uploads/announcements/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
                $file_name = $_FILES['images']['name'][$key];
                $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                $new_file_name = uniqid() . '.' . $file_ext;
                $upload_path = $upload_dir . $new_file_name;

                if (move_uploaded_file($tmp_name, $upload_path)) {
                    // Insert image URL into database using the correct field name
                    $image_stmt = $conn->prepare(
                        "INSERT INTO announcement_images (announcement_id, image_url) 
                         VALUES (?, ?)"
                    );
                    $relative_path = 'uploads/announcements/' . $new_file_name;
                    if (!$image_stmt->execute([$announcement_id, $relative_path])) {
                        error_log("Failed to insert image record: " . print_r($image_stmt->errorInfo(), true));
                    }
                } else {
                    error_log("Failed to move uploaded file: " . $upload_path);
                }
            } else {
                error_log("Upload error for file {$key}: " . $_FILES['images']['error'][$key]);
            }
        }
    }

    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Announcement created successfully',
        'announcement_id' => $announcement_id
    ]);

} catch (Exception $e) {
    error_log("Error in create_announcement.php: " . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}

$conn = null;
?>
