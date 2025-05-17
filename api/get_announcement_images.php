<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

try {
    require 'db_connect.php';
    $conn = db_connect();
    
    if (!isset($_GET['announcement_id'])) {
        throw new Exception("Announcement ID is required");
    }

    $stmt = $conn->prepare(
        "SELECT image_path FROM announcement_images 
         WHERE announcement_id = ? 
         ORDER BY created_at DESC"
    );
    $stmt->execute([$_GET['announcement_id']]);
    $images = $stmt->fetchAll(PDO::FETCH_COLUMN);

    ob_clean();
    echo json_encode(['success' => true, 'data' => $images]);

} catch (Exception $e) {
    ob_clean();
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
