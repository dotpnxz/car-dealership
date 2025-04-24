<?php
$servername = "localhost";
$username = "root";
$password = "admin";

try {
    // First connect without database
    $conn = new PDO("mysql:host=$servername", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if database exists
    $result = $conn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'accounts_user'");
    if ($result->rowCount() == 0) {
        // Create database if it doesn't exist
        $conn->exec("CREATE DATABASE accounts_user");
        echo "Database created successfully\n";
    }
    
    // Select the database
    $conn->exec("USE accounts_user");
    
    // Check if users table exists
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result->rowCount() == 0) {
        // Create users table
        $sql = "CREATE TABLE users (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            fullname VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            accountType ENUM('admin', 'staff', 'user') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conn->exec($sql);
        echo "Users table created successfully\n";
        
        // Create default admin user
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (username, password, fullname, email, accountType) 
                VALUES ('admin', ?, 'Admin User', 'admin@example.com', 'admin')";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$hashedPassword]);
        echo "Default admin user created\n";
    }
    
    echo "Database setup completed successfully";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 