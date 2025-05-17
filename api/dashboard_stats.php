<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once 'db_connect.php';

try {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['accountType'])) {
        throw new Exception('Unauthorized access');
    }

    $conn = db_connect();
    $accountType = $_SESSION['accountType'];
    $userId = $_SESSION['user_id'];
    
    // Initialize base stats
    $stats = [];

    switch($accountType) {
        case 'admin':
            // Get all admin stats in one query for better performance
            $stats = [
                'availableCars' => (int)$conn->query("SELECT COUNT(*) FROM cars WHERE status = 'Available'")->fetchColumn(),
                'totalUsers' => (int)$conn->query("SELECT COUNT(*) FROM users")->fetchColumn(),
                'totalBookings' => (int)$conn->query("SELECT COUNT(*) FROM bookings")->fetchColumn(),
                'pendingBookings' => (int)$conn->query("SELECT COUNT(*) FROM bookings WHERE status = 'Pending'")->fetchColumn(),
                'todayBookings' => (int)$conn->query("SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = CURDATE()")->fetchColumn(),
                'totalReservations' => (int)$conn->query("SELECT COUNT(*) FROM reserved_cars")->fetchColumn(),
                'approvedReservations' => (int)$conn->query("SELECT COUNT(*) FROM reserved_cars WHERE status = 'Reserved'")->fetchColumn(),
                'pendingReservations' => (int)$conn->query("SELECT COUNT(*) FROM reserved_cars WHERE status = 'pending'")->fetchColumn(),
                'totalSellingApplications' => (int)$conn->query("SELECT COUNT(*) FROM car_applications")->fetchColumn(),
                'pendingSellingApplications' => (int)$conn->query("SELECT COUNT(*) FROM car_applications WHERE status = 'pending'")->fetchColumn()
            ];
            break;

        case 'staff':
            $stats = [
                'availableCars' => (int)$conn->query("SELECT COUNT(*) FROM cars WHERE status = 'Available'")->fetchColumn(),
                'totalUsers' => (int)$conn->query("SELECT COUNT(*) FROM users")->fetchColumn(),
                'totalBookings' => (int)$conn->query("SELECT COUNT(*) FROM bookings")->fetchColumn(),
                'assignedBookings' => (int)$conn->query("SELECT COUNT(*) FROM bookings WHERE assigned_to = '$userId' AND status = 'confirmed'")->fetchColumn(),
                'todayBookings' => (int)$conn->query("SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = CURDATE() AND status = 'confirmed'")->fetchColumn(),
                'totalReservations' => (int)$conn->query("SELECT COUNT(*) FROM reserved_cars")->fetchColumn(),
                'approvedReservations' => (int)$conn->query("SELECT COUNT(*) FROM reserved_cars WHERE status = 'Reserved'")->fetchColumn(),
                'pendingReservations' => (int)$conn->query("SELECT COUNT(*) FROM reserved_cars WHERE status = 'pending'")->fetchColumn(),
                'totalSellingApplications' => (int)$conn->query("SELECT COUNT(*) FROM car_applications")->fetchColumn(),
                'pendingSellingApplications' => (int)$conn->query("SELECT COUNT(*) FROM car_applications WHERE status = 'pending'")->fetchColumn()
            ];
            break;

        case 'seller':
            // First verify if seller exists
            $verifyStmt = $conn->prepare("
                SELECT id FROM users 
                WHERE id = ? AND accountType = 'seller'
            ");
            $verifyStmt->execute([$userId]);
            if (!$verifyStmt->fetch()) {
                throw new Exception('Invalid seller account');
            }

            // Get seller-specific stats with error checking
            $stmt = $conn->prepare("
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                FROM car_applications 
                WHERE user_id = ?
            ");

            if (!$stmt->execute([$userId])) {
                throw new Exception('Failed to fetch seller statistics');
            }

            $sellerStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($sellerStats === false) {
                // If no applications found, set all to 0
                $stats = [
                    'totalApplications' => 0,
                    'pendingApplications' => 0,
                    'approvedApplications' => 0,
                    'rejectedApplications' => 0
                ];
            } else {
                $stats = [
                    'totalApplications' => (int)$sellerStats['total'],
                    'pendingApplications' => (int)$sellerStats['pending'],
                    'approvedApplications' => (int)$sellerStats['approved'],
                    'rejectedApplications' => (int)$sellerStats['rejected']
                ];
            }

            // Add debug information in development
            if (defined('DEBUG') && DEBUG) {
                error_log("Seller ID: " . $userId);
                error_log("Seller Stats: " . print_r($sellerStats, true));
            }
            break;

        case 'buyer':
            // Prepare statements for buyer stats
            $stmt = $conn->prepare("
                SELECT 
                    (SELECT COUNT(*) FROM bookings WHERE user_id = ?) as totalBookings,
                    (SELECT COUNT(*) FROM bookings WHERE user_id = ? AND status = 'pending') as pendingBookings,
                    (SELECT COUNT(*) FROM reserved_cars WHERE user_id = ?) as totalReservations,
                    (SELECT COUNT(*) FROM reserved_cars WHERE user_id = ? AND status = 'Reserved') as approvedReservations,
                    (SELECT COUNT(*) FROM bookings WHERE user_id = ? AND DATE(booking_date) = CURDATE() AND status = 'Confirmed') as todayBookings
            ");
            $stmt->execute([$userId, $userId, $userId, $userId, $userId]);
            $buyerStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $stats = [
                'totalBookings' => (int)$buyerStats['totalBookings'],
                'pendingBookings' => (int)$buyerStats['pendingBookings'],
                'totalReservations' => (int)$buyerStats['totalReservations'],
                'approvedReservations' => (int)$buyerStats['approvedReservations'],
                'todayBookings' => (int)$buyerStats['todayBookings']
            ];
            break;

        default:
            throw new Exception('Invalid account type');
    }

    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);

} catch (Exception $e) {
    error_log("Dashboard stats error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
