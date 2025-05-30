<?php
// Set CORS headers
header('Content-Type: application/json');

// Allow CORS for both local and live domains
$allowed_origins = [
    'http://localhost:5173',
    'https://mjautolove.site'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Include database connection
require_once __DIR__ . '/db_connect.php';

// Check if user is logged in and is admin/staff
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

try {
    $conn = db_connect();
    
    // Get user's account type from database using the correct column name 'accountType'
    $userSql = "SELECT accountType FROM users WHERE id = ?";
    $userStmt = $conn->prepare($userSql);
    $userStmt->execute([$_SESSION['user_id']]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !in_array($user['accountType'], ['admin', 'staff'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit();
    }

    error_log("User authorized, fetching sales data.");

    // Get optional month and year parameters
    $month = $_GET['month'] ?? null;
    $year = $_GET['year'] ?? null;

    // Debug: Check if sales table has data
    $checkSql = "SELECT COUNT(*) as count FROM sales";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute();
    $count = $checkStmt->fetch(PDO::FETCH_ASSOC);
    error_log("Debug: Number of records in sales table: " . $count['count']);

    // Get all sales data from the 'sales' table, joining with users and cars for details
    $sql = "
        SELECT 
            s.id,
            s.transaction_type,
            s.car_id,
            s.user_id,
            s.title,
            s.amount,
            s.payment_reference,
            s.transaction_date,
            CONCAT(u.firstName, ' ', u.surname) as customer_name,
            c.brand,
            c.title
        FROM sales AS s
        JOIN users AS u ON s.user_id = u.id
        JOIN cars AS c ON s.car_id = c.id";

    $conditions = [];
    $params = [];

    if ($month !== null && $year !== null) {
        // Filter by month and year
        $conditions[] = "YEAR(s.transaction_date) = ? AND MONTH(s.transaction_date) = ?";
        $params[] = $year;
        $params[] = $month;
    } else if ($year !== null) {
         // Filter by year only
        $conditions[] = "YEAR(s.transaction_date) = ?";
        $params[] = $year;
    } else {
        // Default to current month if no parameters provided (optional, depending on requirement)
        // $conditions[] = "YEAR(s.transaction_date) = YEAR(CURDATE()) AND MONTH(s.transaction_date) = MONTH(CURDATE())";
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $sql .= " ORDER BY s.transaction_date DESC";

    error_log("Debug: Preparing SQL query with filters.");
    error_log("Debug: SQL Query: " . $sql); // Log the final query
    error_log("Debug: Query Params: " . json_encode($params)); // Log the parameters

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    error_log("Debug: Executing SQL query.");
    error_log("Debug: Fetching all results.");
    $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Debug: Log the number of sales records found
    error_log("Debug: Number of sales records found from query: " . count($sales));
    if (count($sales) === 0) {
        error_log("Debug: No sales records found in the query results.");
    }

    // Calculate totals and analyze brands
    $totalSales = 0;
    $totalTransactions = count($sales);
    $brandSales = [];

    foreach ($sales as $sale) {
        error_log("Debug: Processing sale ID " . $sale['id'] . ", Amount: " . $sale['amount']);
        $totalSales += floatval($sale['amount']);

        // Aggregate sales by brand
        $brand = $sale['brand'];
        if (!isset($brandSales[$brand])) {
            $brandSales[$brand] = 0;
        }
        $brandSales[$brand] += floatval($sale['amount']);
    }
    error_log("Debug: Total sales calculated: " . $totalSales);
    error_log("Debug: Brand Sales: " . json_encode($brandSales));

    // Find the brand with the most sales
    $mostSoldBrand = null;
    $highestSalesAmount = 0;

    if (!empty($brandSales)) {
        arsort($brandSales); // Sort brands by sales amount descending
        $mostSoldBrand = key($brandSales);
        $highestSalesAmount = current($brandSales);
    }
     error_log("Debug: Most Sold Brand: " . $mostSoldBrand . " with sales: " . $highestSalesAmount);


    echo json_encode([
        'success' => true,
        'sales' => $sales,
        'summary' => [
            'total_sales' => $totalSales,
            'total_transactions' => $totalTransactions,
            'most_sold_brand' => $mostSoldBrand,
            'highest_sales_amount' => $highestSalesAmount
        ],
        'debug' => [
            'total_records_in_table' => $count['count'],
            'records_found_by_query' => count($sales)
        ]
    ]);

} catch (Exception $e) {
    error_log("Caught Exception in get_sales.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch sales data due to server error',
        'error' => $e->getMessage()
    ]);
} catch (PDOException $e) {
    error_log("Caught PDOException in get_sales.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error fetching sales data',
        'error' => $e->getMessage()
    ]);
}