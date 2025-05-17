<?php
// Start output buffering
ob_start();

function db_connect() {
    try {
        $servername = "localhost";
        $username = "root";
        $password = "admin";
        $dbname = "accounts_user";

        // Log connection attempt
        error_log("Attempting database connection to: $dbname");

        $dsn = "mysql:host=$servername;dbname=$dbname;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];

        $conn = new PDO($dsn, $username, $password, $options);
        error_log("Database connection successful");
        return $conn;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        error_log("Error code: " . $e->getCode());
        return null;
    }
}
?>