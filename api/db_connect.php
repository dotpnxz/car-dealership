<?php
// Start output buffering
ob_start();

function db_connect() {
    $servername = "localhost";
    $username = "root";
    $password = "admin";
    $dbname = "accounts_user";

    try {
        // Connect to MySQL server
        $pdo = new PDO("mysql:host=$servername", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Check if database exists
        $result = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$dbname'");
        if ($result->rowCount() == 0) {
            throw new Exception("Database '$dbname' does not exist");
        }
        
        // Now connect to the specific database
        $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        // Test the connection
        $conn->query("SELECT 1");
        
        // Clear any output
        ob_clean();
        
        return $conn;
    } catch(PDOException $e) {
        // Clear any output
        ob_clean();
        error_log("Database connection failed: " . $e->getMessage());
        throw new Exception("Database connection failed: " . $e->getMessage());
    }
}
?>