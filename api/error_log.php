<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

$error_log = error_get_last();
echo json_encode(['error' => $error_log]);
?>
