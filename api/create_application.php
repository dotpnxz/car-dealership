<?php
// Turn off error reporting and start output buffering
error_reporting(0);
ini_set('display_errors', 0);
ob_start();

session_start();
require_once 'db_connect.php';  // Make sure this path is correct
$conn = db_connect();  // Add this line to get connection

// Set headers
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
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Debug logging
    error_log("Received FILES: " . print_r($_FILES, true));
    error_log("Received POST: " . print_r($_POST, true));

    // Create upload directories if they don't exist
    $valid_id_dir = '../uploads/valid_ID/';
    $car_photos_dir = '../uploads/selling_car_photos/';

    foreach ([$valid_id_dir, $car_photos_dir] as $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
            chmod($dir, 0777);   // Ensure write permissions
        }
    }

    // Handle form data - Expecting JSON in 'applicationData' field
    if (!isset($_POST['applicationData']) || empty($_POST['applicationData'])) {
        throw new Exception('No application data received in the applicationData field.');
    }

    $applicationData = json_decode($_POST['applicationData'], true);

    if (!$applicationData || !is_array($applicationData)) {
        throw new Exception('Failed to decode application data. Raw data: ' . $_POST['applicationData']);
    }

    // Validate files with detailed error checking
    if (!isset($_FILES['validId'])) {
        throw new Exception('Valid ID file not received');
    }

    if ($_FILES['validId']['error'] !== 0) {
        $uploadErrors = array(
            1 => "File exceeds upload_max_filesize",
            2 => "File exceeds MAX_FILE_SIZE",
            3 => "File was only partially uploaded",
            4 => "No file was uploaded",
            6 => "Missing a temporary folder",
            7 => "Failed to write file to disk",
            8 => "A PHP extension stopped the file upload"
        );
        $errorMessage = isset($uploadErrors[$_FILES['validId']['error']])
            ? $uploadErrors[$_FILES['validId']['error']]
            : "Unknown upload error";
        throw new Exception('Valid ID upload error: ' . $errorMessage);
    }

    // Process valid ID with additional checks
    $valid_id_ext = strtolower(pathinfo($_FILES['validId']['name'], PATHINFO_EXTENSION));
    if (!in_array($valid_id_ext, ['jpg', 'jpeg', 'png', 'gif'])) {
        throw new Exception('Invalid file type for Valid ID. Allowed: jpg, jpeg, png, gif');
    }

    $valid_id_filename = uniqid('id_') . '.' . $valid_id_ext;
    $valid_id_path = 'uploads/valid_ID/' . $valid_id_filename;

    if (!move_uploaded_file($_FILES['validId']['tmp_name'], '../' . $valid_id_path)) {
        throw new Exception('Failed to upload valid ID');
    }

    // Process car photos
    $car_photo_paths = [];
    if (isset($_FILES['carPhotos']) && is_array($_FILES['carPhotos']['tmp_name'])) {
        foreach ($_FILES['carPhotos']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['carPhotos']['error'][$key] === 0) {
                $ext = strtolower(pathinfo($_FILES['carPhotos']['name'][$key], PATHINFO_EXTENSION));
                $filename = uniqid('car_') . '.' . $ext;
                $relative_path = 'uploads/selling_car_photos/' . $filename;

                if (move_uploaded_file($tmp_name, '../' . $relative_path)) {
                    $car_photo_paths[] = $relative_path;
                }
            } elseif ($_FILES['carPhotos']['error'][$key] !== 4) { // Log other errors than no file uploaded
                error_log("Car photo upload error for index $key: " . $_FILES['carPhotos']['error'][$key]);
            }
        }
    } else {
        error_log("No car photos were received or the structure is incorrect.");
    }

    // Start transaction
    $conn->beginTransaction();

    // Insert application
    $stmt = $conn->prepare("INSERT INTO car_applications (
        user_id, brand, model, year, variant, mileage, chassis,
        transmission, fuel_type, color, issues, asking_price,
        is_first_owner, is_registered_owner, has_documents, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");

    $result = $stmt->execute([
        $_SESSION['user_id'],
        $applicationData['brand'] ?? null,
        $applicationData['model'] ?? null,
        $applicationData['year'] ?? null,
        $applicationData['variant'] ?? null,
        $applicationData['mileage'] ?? null,
        $applicationData['chassis'] ?? null,
        $applicationData['transmission'] ?? null,
        $applicationData['fuel_type'] ?? null, // Match database column
        $applicationData['color'] ?? null,
        $applicationData['issues'] ?? null,
        $applicationData['asking_price'] ?? null, // Match database column
        $applicationData['is_first_owner'] ?? null, // Match database column
        $applicationData['is_registered_owner'] ?? null, // Match database column
        $applicationData['has_documents'] ?? null, // Match database column
    ]);

    if (!$result) {
        throw new Exception('Failed to create application');
    }

    $application_id = $conn->lastInsertId();

    // Insert valid ID image
    $photo_stmt = $conn->prepare("INSERT INTO application_images (application_id, image_path, image_type) VALUES (?, ?, ?)");
    $photo_stmt->execute([$application_id, $valid_id_path, 'id']);

    // Insert car photos
    foreach ($car_photo_paths as $photo_path) {
        $photo_stmt->execute([$application_id, $photo_path, 'car']);
    }

    // Commit transaction
    $conn->commit();

    ob_clean();
    echo json_encode([
        'success' => true,
        'applicationId' => $application_id,
        'message' => 'Application created successfully'
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }

    error_log("Application Error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());

    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => $_FILES ? print_r($_FILES, true) : 'No files received',
        'post' => $_POST ? print_r($_POST, true) : 'No POST data received'
    ]);
}

ob_end_flush();
?>