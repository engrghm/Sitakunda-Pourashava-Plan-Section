<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Only POST is accepted.']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    $errorCode = $_FILES['file']['error'] ?? 'NO_FILE';
    echo json_encode(['error' => 'No file uploaded or upload error occurred', 'code' => $errorCode]);
    exit;
}

$file = $_FILES['file'];
$maxSizeBytes = 10 * 1024 * 1024; // 10 MB maximum

if ($file['size'] > $maxSizeBytes) {
    http_response_code(400);
    echo json_encode(['error' => 'ফাইলের সাইজ ১০ মেগাবাইটের বেশি হতে পারবে না।']);
    exit;
}

$allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
$originalName = $file['name'];
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

if (!in_array($ext, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['error' => 'শুধুমাত্র PDF, JPG, JPEG, PNG অথবা WEBP ফাইল আপলোড করা যাবে।']);
    exit;
}

$uploadDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique, clean file name
$cleanPrefix = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
$cleanPrefix = substr($cleanPrefix, 0, 30);
$uniqueName = 'doc_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $cleanPrefix . '.' . $ext;
$targetPath = $uploadDir . '/' . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'ফাইল সার্ভারে সংরক্ষণ করতে ব্যর্থ হয়েছে।']);
    exit;
}

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$fileUrl = '/uploads/' . $uniqueName;
$fullFileUrl = $protocol . $host . $fileUrl;

echo json_encode([
    'success' => true,
    'fileUrl' => $fileUrl,
    'fullFileUrl' => $fullFileUrl,
    'fileName' => $originalName,
    'fileSize' => $file['size'],
    'fileType' => $file['type'],
    'uploadedAt' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
