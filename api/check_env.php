
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "PayMongo Secret Key: " . (getenv('PAYMONGO_SECRET_KEY') ? "Set" : "Not Set") . "\n";
echo "PayMongo Webhook Key: " . (getenv('PAYMONGO_WEBHOOK_SECRET_KEY') ? "Set" : "Not Set") . "\n";