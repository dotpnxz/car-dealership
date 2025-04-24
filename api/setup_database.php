<?php
// Start output buffering
ob_start();

$servername = "localhost";
$username = "root";
$password = "admin";
$dbname = "accounts_user";

try {
    // Connect to MySQL server
    $pdo = new PDO("mysql:host=$servername", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    $pdo->exec("USE `$dbname`");
    
    // Create users table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `fullname` VARCHAR(255) NOT NULL,
        `username` VARCHAR(50) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `birthDay` INT,
        `birthMonth` INT,
        `birthYear` INT,
        `contactNo` VARCHAR(20),
        `gender` VARCHAR(10),
        `address` TEXT,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    echo "Database and table setup completed successfully.";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}

// Close the connection
$pdo = null;
?> 