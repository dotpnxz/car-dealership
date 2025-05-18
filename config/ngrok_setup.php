<?php
require_once(__DIR__ . '/config.php');

$authToken = getenv('NGROK_AUTH_TOKEN');

if (empty($authToken)) {
    die("Error: NGROK_AUTH_TOKEN not found in environment variables\n");
}

// Configure ngrok
$command = "ngrok config add-authtoken " . escapeshellarg($authToken);
exec($command, $output, $returnCode);

if ($returnCode !== 0) {
    die("Error configuring ngrok: " . implode("\n", $output) . "\n");
}

echo "Ngrok configured successfully!\n";
