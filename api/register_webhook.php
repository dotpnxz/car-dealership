<?php
require_once(__DIR__ . '/../vendor/autoload.php');
require_once(__DIR__ . '/../config/config.php');

header('Content-Type: application/json');

try {
    $client = new \GuzzleHttp\Client();
    $secretKey = rtrim(getenv('PAYMONGO_SECRET_KEY'), ':');
    $ngrokUrl = getenv('NGROK_URL');

    // List all webhooks
    $listResponse = $client->request('GET', 'https://api.paymongo.com/v1/webhooks', [
        'headers' => [
            'accept' => 'application/json',
            'authorization' => 'Basic ' . base64_encode($secretKey . ':')
        ]
    ]);

    $webhooks = json_decode($listResponse->getBody(), true);
    $existingWebhook = null;

    // Check if webhook exists and its state
    if (isset($webhooks['data']) && is_array($webhooks['data'])) {
        foreach ($webhooks['data'] as $webhook) {
            if (isset($webhook['attributes']['url']) && $webhook['attributes']['url'] === $ngrokUrl) {
                $existingWebhook = $webhook;
                break;
            }
        }
    }

    if ($existingWebhook) {
        // Check if webhook is enabled by checking status
        $isEnabled = isset($existingWebhook['attributes']['status']) 
            && $existingWebhook['attributes']['status'] === 'enabled';

        if (!$isEnabled) {
            $response = $client->request('POST', 'https://api.paymongo.com/v1/webhooks/' . $existingWebhook['id'] . '/enable', [
                'headers' => [
                    'accept' => 'application/json',
                    'authorization' => 'Basic ' . base64_encode($secretKey . ':')
                ]
            ]);
            echo json_encode([
                'success' => true,
                'message' => 'Existing webhook enabled',
                'data' => json_decode($response->getBody(), true)
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'Webhook already exists and is enabled',
                'data' => $existingWebhook
            ]);
        }
    } else {
        // Create new webhook
        $response = $client->request('POST', 'https://api.paymongo.com/v1/webhooks', [
            'headers' => [
                'accept' => 'application/json',
                'authorization' => 'Basic ' . base64_encode($secretKey . ':'),
                'content-type' => 'application/json'
            ],
            'json' => [
                'data' => [
                    'attributes' => [
                        'events' => ['payment.paid'],
                        'url' => $ngrokUrl
                    ]
                ]
            ]
        ]);
        echo json_encode([
            'success' => true,
            'message' => 'New webhook created',
            'data' => json_decode($response->getBody(), true)
        ]);
    }
} catch (Exception $e) {
    error_log("Webhook operation failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
