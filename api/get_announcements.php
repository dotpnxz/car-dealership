<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

try {
    require 'db_connect.php';
    $conn = db_connect();

    // Get all announcements
    $query = "SELECT a.*, GROUP_CONCAT(ai.image_url) as images 
              FROM announcements a 
              LEFT JOIN announcement_images ai ON a.id = ai.announcement_id 
              GROUP BY a.id 
              ORDER BY a.created_at DESC";
    
    $stmt = $conn->query($query);
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process the results
    foreach ($announcements as &$announcement) {
        $announcement['images'] = $announcement['images'] 
            ? explode(',', $announcement['images']) 
            : [];
    }

    ob_clean();
    echo json_encode([
        'success' => true,
        'data' => $announcements
    ]);

} catch (Exception $e) {
    error_log("Error in get_announcements.php: " . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn = null;
?>
