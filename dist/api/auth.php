<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDbConnection();
$action = isset($_GET['action']) ? $_GET['action'] : 'login';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true) ?: [];

    if ($action === 'login') {
        $username = trim($payload['username'] ?? '');
        $password = trim($payload['password'] ?? '');

        if (!$username || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'ইউজারনেম ও পাসওয়ার্ড প্রদান করুন']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM officers WHERE LOWER(username) = LOWER(:u) LIMIT 1");
        $stmt->execute([':u' => $username]);
        $officer = $stmt->fetch();

        if ($officer && $officer['password_hash'] === $password) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'username' => $officer['username'],
                    'role' => $officer['role'],
                    'title' => $officer['title']
                ]
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়']);
        }
        exit;
    }

    if ($action === 'change_password') {
        $username = trim($payload['username'] ?? '');
        $oldPassword = trim($payload['oldPassword'] ?? '');
        $newPassword = trim($payload['newPassword'] ?? '');

        if (strlen($newPassword) < 4) {
            http_response_code(400);
            echo json_encode(['error' => 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM officers WHERE LOWER(username) = LOWER(:u) LIMIT 1");
        $stmt->execute([':u' => $username]);
        $officer = $stmt->fetch();

        if ($officer && $officer['password_hash'] === $oldPassword) {
            $updateStmt = $pdo->prepare("UPDATE officers SET password_hash = :p, updated_at = NOW() WHERE username = :u");
            $updateStmt->execute([':p' => $newPassword, ':u' => $officer['username']]);
            echo json_encode(['success' => true, 'message' => 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে']);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'বর্তমান পাসওয়ার্ড সঠিক নয়']);
        }
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
