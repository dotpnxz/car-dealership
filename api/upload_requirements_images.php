<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    $conn = db_connect();
    $loan_requirement_id = $_POST['loan_requirement_id'] ?? null;
    if (!$loan_requirement_id) {
        throw new Exception('Missing loan_requirement_id');
    }

    $uploadDir = __DIR__ . '/../uploads/loanrequirements/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $allowedFields = [
        'valid_id_1' => 'valid_ID',
        'valid_id_2' => 'valid_ID',
        'bank_statement' => 'bank_statement',
        'proof_billing' => 'proof_of_billing',
        'coe_payslip' => 'coe',
        'business_permit' => 'business_permit',
    ];

    $uploaded = [];
    foreach ($allowedFields as $field => $requirementType) {
        if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) continue;
        $file = $_FILES[$field];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid($requirementType . '_') . '.' . $ext;
        $targetPath = $uploadDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Failed to move uploaded file: ' . $file['name']);
        }
        // Save to DB
        $stmt = $conn->prepare("INSERT INTO requirements_images (loan_requirement_id, requirement_type, file_path) VALUES (?, ?, ?)");
        $stmt->execute([$loan_requirement_id, $requirementType, 'uploads/loanrequirements/' . $filename]);
        $uploaded[] = [
            'requirement_type' => $requirementType,
            'file_path' => 'uploads/loanrequirements/' . $filename
        ];
    }

    echo json_encode([
        'success' => true,
        'uploaded' => $uploaded
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 