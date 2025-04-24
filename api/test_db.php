<?php
// MySQL Workbench connection details
$servername = "localhost";
$username = "root";
$password = "admin";  // Change this to your MySQL Workbench root password
$dbname = "car_dealership";

try {
    // First, try to connect to MySQL server
    $conn = new PDO("mysql:host=$servername", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected to MySQL server successfully<br>";

    // Check if database exists
    $stmt = $conn->query("SHOW DATABASES LIKE '$dbname'");
    if ($stmt->rowCount() > 0) {
        echo "Database '$dbname' exists<br>";
        
        // Select the database
        $conn->exec("USE $dbname");
        
        // Check if users table exists
        $stmt = $conn->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() > 0) {
            echo "Users table exists<br>";
            
            // Count users
            $stmt = $conn->query("SELECT COUNT(*) FROM users");
            $count = $stmt->fetchColumn();
            echo "Number of users: " . $count . "<br>";
            
            // List all users
            $stmt = $conn->query("SELECT * FROM users");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "Users in database:<br>";
            echo "<pre>";
            print_r($users);
            echo "</pre>";
        } else {
            echo "Users table does not exist. Creating it...<br>";
            
            // Create users table
            $sql = "CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                fullname VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                accountType ENUM('admin', 'staff', 'user') NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            $conn->exec($sql);
            echo "Users table created successfully<br>";
            
            // Create default admin user
            $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (username, password, fullname, email, accountType) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['admin', $hashedPassword, 'Administrator', 'admin@example.com', 'admin']);
            echo "Default admin user created successfully<br>";
        }
    } else {
        echo "Database '$dbname' does not exist. Creating it...<br>";
        
        // Create database
        $conn->exec("CREATE DATABASE $dbname");
        echo "Database created successfully<br>";
        
        // Select the database
        $conn->exec("USE $dbname");
        
        // Create users table
        $sql = "CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            fullname VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            accountType ENUM('admin', 'staff', 'user') NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conn->exec($sql);
        echo "Users table created successfully<br>";
        
        // Create default admin user
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (username, password, fullname, email, accountType) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['admin', $hashedPassword, 'Administrator', 'admin@example.com', 'admin']);
        echo "Default admin user created successfully<br>";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "<br>";
    echo "Please check your MySQL Workbench credentials. Make sure:<br>";
    echo "1. MySQL Workbench is running<br>";
    echo "2. The username and password are correct<br>";
    echo "3. The server is accessible on localhost<br>";
}
?> 