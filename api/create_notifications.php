<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

require_once 'db_connect.php';

try {
    $conn = db_connect();
    
    // Create notifications table if not exists
    $conn->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        announcement_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    // Insert notifications for all users except admin
    if (isset($_POST['announcement_id'])) {
        $stmt = $conn->prepare("INSERT INTO notifications (user_id, announcement_id) 
            SELECT id, ? FROM users WHERE accountType != 'admin'");
        $stmt->execute([$_POST['announcement_id']]);
        
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
