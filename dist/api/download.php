<?php
require_once __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$fileParam = trim($_GET['file'] ?? $_GET['url'] ?? '');
$nameParam = trim($_GET['name'] ?? $_GET['filename'] ?? '');

if (!$fileParam) {
    http_response_code(400);
    echo json_encode(['error' => 'ফাইল পাথ প্রদান করা হয়নি।']);
    exit;
}

// Clean filename to prevent directory traversal
$cleanFile = basename(parse_url($fileParam, PHP_URL_PATH));
$cleanFile = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $cleanFile);

$possibleDirs = [
    dirname(__DIR__) . '/uploads',
    __DIR__ . '/../uploads',
    ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/uploads',
    dirname(__DIR__) . '/public/uploads',
];

$filePath = null;
foreach ($possibleDirs as $dir) {
    if (!$dir) continue;
    $target = $dir . '/' . $cleanFile;
    if (file_exists($target) && is_file($target)) {
        $filePath = realpath($target);
        break;
    }
}

if (!$filePath || !file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'অনুরোধকৃত ফাইলটি সার্ভারে পাওয়া যায়নি।', 'file' => $cleanFile]);
    exit;
}

$ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$mimeMap = [
    'pdf'  => 'application/pdf',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'txt'  => 'text/plain; charset=utf-8',
];
$contentType = $mimeMap[$ext] ?? 'application/octet-stream';

$downloadName = $nameParam ? basename($nameParam) : $cleanFile;
if (!pathinfo($downloadName, PATHINFO_EXTENSION)) {
    $downloadName .= '.' . $ext;
}

// Clean download name for Content-Disposition header
$asciiName = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $downloadName);
$encodedName = rawurlencode($downloadName);

header('Content-Description: File Transfer');
header('Content-Type: ' . $contentType);
header('Content-Disposition: attachment; filename="' . $asciiName . '"; filename*=UTF-8\'\'' . $encodedName);
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: ' . filesize($filePath));

// Clear output buffers and send file
if (ob_get_level()) {
    ob_end_clean();
}
readfile($filePath);
exit;
