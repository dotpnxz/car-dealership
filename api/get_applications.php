<?php
session_start();
ob_start();

// Error reporting setup
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';
$conn = db_connect();

// Authentication check
if (!isset($_SESSION['user_id']) || !isset($_SESSION['accountType'])) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit;
}

try {
    $userId = $_SESSION['user_id'];
    $accountType = $_SESSION['accountType'];
    
    // Base query with all necessary joins
    $baseQuery = "
        SELECT 
            ca.*,
            u.username as seller_name,
            u.email as seller_email,
            CONCAT(u.firstName, ' ', u.surname) as seller_full_name
        FROM car_applications ca
        JOIN users u ON ca.user_id = u.id
    ";

    // Modify query based on user role
    if ($accountType === 'admin' || $accountType === 'staff') {
        // Admin and staff can see all applications
        $query = $baseQuery . " ORDER BY ca.created_at DESC";
        $stmt = $conn->prepare($query);
    } elseif ($accountType === 'seller') {
        // Sellers can only see their own applications
        $query = $baseQuery . " WHERE ca.user_id = :userId ORDER BY ca.created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    } else {
        // Other user types shouldn't see any applications
        throw new Exception('Unauthorized access');
    }

    // Execute query with error checking
    if (!$stmt->execute()) {
        error_log("Query execution failed: " . print_r($stmt->errorInfo(), true));
        throw new PDOException("Failed to fetch applications");
    }

    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log success for debugging
    error_log("Successfully fetched applications for user $userId with role $accountType");
    error_log("Number of applications found: " . count($applications));

    echo json_encode([
        'success' => true,
        'applications' => $applications
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

ob_end_flush();
?>