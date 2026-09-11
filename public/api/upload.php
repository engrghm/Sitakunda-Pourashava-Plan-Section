<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set runtime limits where supported
@ini_set('upload_max_filesize', '64M');
@ini_set('post_max_size', '64M');
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', '300');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Only POST is accepted.']);
    exit;
}

$uploadDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
}
@chmod($uploadDir, 0777);

$allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
$maxSizeBytes = 30 * 1024 * 1024; // 30 MB maximum

// Helper to determine root or subfolder base URL
$scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$basePath = ($scriptDir === '/' || $scriptDir === '\\' || $scriptDir === '.' || empty($scriptDir)) ? '' : rtrim(str_replace('\\', '/', $scriptDir), '/');
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';

// 1. Check if multipart/form-data file was received
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['file'];
    if ($file['size'] > $maxSizeBytes) {
        http_response_code(400);
        echo json_encode(['error' => 'ফাইলের সাইজ ৩০ মেগাবাইটের বেশি হতে পারবে না।']);
        exit;
    }

    $originalName = $file['name'];
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExtensions)) {
        http_response_code(400);
        echo json_encode(['error' => 'শুধুমাত্র PDF, JPG, JPEG, PNG অথবা WEBP ফাইল আপলোড করা যাবে।']);
        exit;
    }

    $cleanPrefix = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
    $cleanPrefix = substr($cleanPrefix, 0, 35);
    $uniqueName = 'doc_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $cleanPrefix . '.' . $ext;
    $targetPath = $uploadDir . '/' . $uniqueName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath) && !copy($file['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'ফাইল সার্ভারে সংরক্ষণ করতে ব্যর্থ হয়েছে। ফোল্ডার পারমিশন চেক করুন।']);
        exit;
    }

    $fileUrl = $basePath . '/uploads/' . $uniqueName;
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
    exit;
}

// 2. Check if JSON payload with base64 fileData was sent
$rawInput = file_get_contents('php://input');
if ($rawInput) {
    $json = json_decode($rawInput, true);
    if ($json && !empty($json['fileData'])) {
        $originalName = $json['fileName'] ?? ('doc_' . time() . '.pdf');
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if (!$ext || !in_array($ext, $allowedExtensions)) {
            $ext = 'pdf';
        }

        $base64Data = $json['fileData'];
        if (strpos($base64Data, ',') !== false) {
            $base64Data = explode(',', $base64Data)[1];
        }
        $binary = base64_decode($base64Data);
        if ($binary !== false) {
            if (strlen($binary) > $maxSizeBytes) {
                http_response_code(400);
                echo json_encode(['error' => 'ফাইলের সাইজ ৩০ মেগাবাইটের বেশি হতে পারবে না।']);
                exit;
            }

            $cleanPrefix = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
            $cleanPrefix = substr($cleanPrefix, 0, 35);
            $uniqueName = 'doc_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $cleanPrefix . '.' . $ext;
            $targetPath = $uploadDir . '/' . $uniqueName;

            if (file_put_contents($targetPath, $binary) !== false) {
                $fileUrl = $basePath . '/uploads/' . $uniqueName;
                $fullFileUrl = $protocol . $host . $fileUrl;

                echo json_encode([
                    'success' => true,
                    'fileUrl' => $fileUrl,
                    'fullFileUrl' => $fullFileUrl,
                    'fileName' => $originalName,
                    'fileSize' => strlen($binary),
                    'fileType' => 'application/' . $ext,
                    'uploadedAt' => date('Y-m-d H:i:s')
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    }
}

$errorCode = $_FILES['file']['error'] ?? 'NO_FILE';
$errorMsg = 'No file uploaded or upload error occurred';
if ($errorCode === UPLOAD_ERR_INI_SIZE || $errorCode === UPLOAD_ERR_FORM_SIZE) {
    $errorMsg = 'ফাইলের সাইজ সার্ভারের নির্ধারিত সীমার বেশি।';
} elseif ($errorCode === UPLOAD_ERR_PARTIAL) {
    $errorMsg = 'ফাইলটি সম্পূর্ণ আপলোড হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
}
http_response_code(400);
echo json_encode(['error' => $errorMsg, 'code' => $errorCode]);
