<?php
header('Content-Type: application/json');

require_once 'db_connect.php';

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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $conn = db_connect();

    // Create reserved_cars table
    $sql = "CREATE TABLE IF NOT EXISTS reserved_cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        car_id INT NOT NULL,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        fullname VARCHAR(255) NOT NULL,
        contactNo VARCHAR(20),
        address TEXT,
        payment_status ENUM('pending', 'paid', 'failed', 'cancelled', 'refund_requested', 'refunded') DEFAULT 'pending',
        payment_reference VARCHAR(255),
        payment_amount DECIMAL(10,2),
        reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (car_id) REFERENCES cars(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )";

    $conn->exec($sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'Reserved cars table created or verified successfully'
    ]);

} catch(PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
