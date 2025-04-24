<?php
// Database configuration
$host = 'localhost';
$dbname = 'car_dealership';
$username = 'root';
$password = ''; // Leave empty if no password is set

try {
    // First try without password
    $conn = new mysqli($host, $username, $password, $dbname);
    
    // If connection fails, try with common XAMPP password
    if ($conn->connect_error) {
        $password = 'root'; // Common XAMPP default password
        $conn = new mysqli($host, $username, $password, $dbname);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error . 
                "\nPlease check your MySQL credentials in XAMPP. " .
                "Common passwords are empty string ('') or 'root'");
        }
    }
    
    // Set charset to utf8mb4
    $conn->set_charset("utf8mb4");
    
} catch (Exception $e) {
    // Send JSON response instead of dying
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    exit();
} 