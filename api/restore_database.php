<?php
// Set CORS headers
header('Content-Type: application/json');

require_once 'db_connect.php'; // Assuming this file connects to your database and returns a PDO object

// Allow CORS for both local and live domains
$allowed_origins = [
    'http://localhost:5173',
    'https://mjautolove.site'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    if (!isset($_FILES['sqlfile'])) {
        throw new Exception('No file uploaded');
    }

    // Get database connection from db_connect.php
    $pdo = db_connect();

    // Upload handling
    $tmpFile = $_FILES['sqlfile']['tmp_name'];
    if (!file_exists($tmpFile)) {
        throw new Exception("No file uploaded or file missing.");
    }

    $sql = file_get_contents($tmpFile);

    // Optional: Disable foreign key checks
    // This is good practice for restores to avoid issues with table creation order
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");

    // --- Start of improved SQL parsing logic for DELIMITER ---
    $statements = [];
    $currentStatement = '';
    $delimiter = ';'; // Default SQL delimiter

    // Split SQL into individual lines
    $lines = explode("\n", $sql);
    foreach ($lines as $line) {
        $trimmedLine = rtrim($line); // Use rtrim to avoid issues with leading spaces or tabs

        // Detect and handle DELIMITER command
        // Matches "DELIMITER [any_string]" case-insensitively
        if (preg_match('/^DELIMITER\s+(.+)$/i', $trimmedLine, $matches)) {
            // Before changing delimiter, if there's a partial statement accumulated,
            // add it to statements (this covers cases where DELIMITER changes directly after a statement).
            if (!empty($currentStatement)) {
                $statements[] = trim($currentStatement);
            }
            $currentStatement = ''; // Clear for next statement
            $delimiter = trim($matches[1]); // Set new delimiter (e.g., "$$" or ";")
            continue; // Skip the DELIMITER command line itself
        }

        // Basic comment handling (assuming comments are at the start of the line or separate lines)
        // This is a simple check; for production, a more robust SQL parser might be needed
        // to handle comments embedded within statements.
        if (strpos(ltrim($trimmedLine), '--') === 0 || strpos(ltrim($trimmedLine), '#') === 0 || strpos(ltrim($trimmedLine), '/*') === 0) {
             // If this line is a comment, and it's the only content in currentStatement, don't append it
            if (empty(trim($currentStatement))) {
                continue;
            }
        }

        // Check if the current line *is* the delimiter
        // This is crucial for multi-line statements (like triggers) that end with '$$'
        if ($trimmedLine === $delimiter) {
            $finalStatement = trim($currentStatement); // Statement accumulated up to this point
            if (!empty($finalStatement)) {
                $statements[] = $finalStatement;
            }
            $currentStatement = ''; // Reset for next statement
        } else {
            // If it's not the delimiter line or a DELIMITER command, append to current statement
            $currentStatement .= $trimmedLine . "\n"; // Add newline back to preserve multi-line statements structure
        }
    }

    // Add any remaining statement if the file doesn't end with a delimiter
    if (!empty($currentStatement)) {
        $statements[] = trim($currentStatement);
    }
    // --- End of improved SQL parsing logic ---


    // Execute all statements directly
    foreach ($statements as $stmt) {
        if (empty($stmt)) continue;

        try {
            $pdo->exec($stmt);
        } catch (PDOException $e) {
            error_log("Error executing SQL statement:");
            error_log("SQL: " . $stmt);
            error_log("Error message: " . $e->getMessage());
            // Re-enable foreign key checks before throwing, to leave DB in a more consistent state if it fails
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
            throw $e; // Re-throw the exception to be caught by the outer catch block
        }
    }

    // Re-enable foreign key checks after all statements are executed
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Verify the restore was successful
    // Ensure 'cars' table exists; otherwise, this query will also fail.
    $carCount = $pdo->query("SELECT COUNT(*) FROM cars")->fetchColumn();
    if ($carCount === false) { // PDO::query returns false on error
        throw new Exception("Restore verification failed: 'cars' table might not exist or query failed.");
    }
    // You can remove the 'carCount === 0' check if your dump might legitimately have no cars.
    // if ($carCount === 0) {
    //     throw new Exception("Restore verification failed: No cars found in database after restore.");
    // }

    echo json_encode([
        'success' => true,
        'message' => 'Database restored successfully',
        'carCount' => $carCount // Provide car count for verification
    ]);

} catch (PDOException $e) {
    error_log("Database restore error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database restore failed: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Restore error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Restore failed: ' . $e->getMessage()
    ]);
}
?>