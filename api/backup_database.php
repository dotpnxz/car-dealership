<?php
// Set CORS headers
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
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    // Get database connection from db_connect.php
    $pdo = db_connect();
    
    // Get database name from the connection
    $dbname = $pdo->query("SELECT DATABASE()")->fetchColumn();
    
    // Generate file name
    $backupFile = 'backup_' . $dbname . '_' . date('Y-m-d_H-i-s') . '.sql';
    
    // Buffer the SQL contents
    $sqlContent = "-- Backup of `$dbname` on " . date('Y-m-d H:i:s') . "\n\n";
    
    // Get all table names
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        // Get CREATE TABLE statement
        $createStmt = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
        $sqlContent .= "--\n-- Table structure for `$table`\n--\n";
        $sqlContent .= "DROP TABLE IF EXISTS `$table`;\n";
        $sqlContent .= $createStmt['Create Table'] . ";\n\n";
        
        // Get table data
        $rows = $pdo->query("SELECT * FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);
        if ($rows) {
            $sqlContent .= "--\n-- Data for `$table`\n--\n";
            foreach ($rows as $row) {
                $vals = array_map(function ($val) use ($pdo) {
                    return $pdo->quote($val);
                }, array_values($row));
                $sqlContent .= "INSERT INTO `$table` VALUES (" . implode(",", $vals) . ");\n";
            }
            $sqlContent .= "\n";
        }
    }
    
    // Send headers to force download
    header('Content-Type: application/sql');
    header('Content-Disposition: attachment; filename="' . $backupFile . '"');
    header('Content-Length: ' . strlen($sqlContent));
    
    // Output the SQL content
    echo $sqlContent;
    exit;
    
} catch (PDOException $e) {
    error_log("Database backup error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database backup failed: ' . $e->getMessage()
    ]);
    exit;
}
?> 