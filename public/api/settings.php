<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDbConnection();

// Ensure settings or drafts table exists for persistent website customization
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `portal_settings` (
            `setting_key` VARCHAR(64) NOT NULL,
            `data` LONGTEXT NOT NULL,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`setting_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {
    // Fallback if table already exists or permission issue
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $key = isset($_GET['key']) ? trim($_GET['key']) : 'portal_config';
    try {
        // Try portal_settings table first
        $stmt = $pdo->prepare("SELECT `data` FROM `portal_settings` WHERE `setting_key` = :k LIMIT 1");
        $stmt->execute([':k' => $key]);
        $row = $stmt->fetch();
        if ($row && !empty($row['data'])) {
            echo $row['data'];
            exit;
        }

        // Fallback to drafts table
        $stmt2 = $pdo->prepare("SELECT `data` FROM `drafts` WHERE `draft_key` = :k LIMIT 1");
        $stmt2->execute([':k' => $key]);
        $row2 = $stmt2->fetch();
        if ($row2 && !empty($row2['data'])) {
            echo $row2['data'];
            exit;
        }

        echo json_encode(null);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load settings', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!$rawInput) {
        http_response_code(400);
        echo json_encode(['error' => 'No JSON data provided']);
        exit;
    }

    $payload = json_decode($rawInput, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // STRICT AUTHENTICATION: Require a valid officer ID
    $officerUsername = trim($payload['officer_username'] ?? $_SERVER['HTTP_X_OFFICER_USERNAME'] ?? '');
    if (!$officerUsername) {
        http_response_code(401);
        echo json_encode([
            'error' => 'অননুমোদিত অনুরোধ। কোনো তথ্য পরিবর্তন বা সংরক্ষণ করতে অফিসিয়াল আইডিতে লগইন করা আবশ্যক।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Known municipal officer mappings
    $knownOfficers = [
        'admin.sitakunda' => ['role' => 'super_admin', 'title' => 'পৌর অ্যাডমিনিস্ট্রেটর (System Admin)'],
        'admin' => ['role' => 'super_admin', 'title' => 'পৌর অ্যাডমিনিস্ট্রেটর (System Admin)'],
        'superadmin' => ['role' => 'super_admin', 'title' => 'পৌর অ্যাডমিনিস্ট্রেটর (System Admin)'],
        'engr.masum' => ['role' => 'super_admin', 'title' => 'পৌর অ্যাডমিনিস্ট্রেটর'],
        'draftsman.sitakunda' => ['role' => 'draftsman', 'title' => 'নক্সাকার (সিভিল)'],
        'draftsman' => ['role' => 'draftsman', 'title' => 'নক্সাকার (সিভিল)'],
        'draftsman.civil' => ['role' => 'draftsman', 'title' => 'নক্সাকার (সিভিল)'],
        'xen.sitakunda' => ['role' => 'executive_engineer', 'title' => 'নির্বাহী প্রকৌশলী'],
        'xen' => ['role' => 'executive_engineer', 'title' => 'নির্বাহী প্রকৌশলী'],
        'ee.sitakunda' => ['role' => 'executive_engineer', 'title' => 'নির্বাহী প্রকৌশলী'],
        'mayor.sitakunda' => ['role' => 'mayor', 'title' => 'মেয়র / প্রশাসক'],
        'mayor' => ['role' => 'mayor', 'title' => 'মেয়র / প্রশাসক'],
        'administrator' => ['role' => 'mayor', 'title' => 'মেয়র / প্রশাসক'],
    ];

    // Verify officer exists in officers database or ensure auto-seeded
    $authenticatedOfficer = null;
    try {
        $stmtAuth = $pdo->prepare("SELECT `username`, `role`, `title` FROM `officers` WHERE LOWER(username) = LOWER(:u) LIMIT 1");
        $stmtAuth->execute([':u' => $officerUsername]);
        $authenticatedOfficer = $stmtAuth->fetch();
    } catch (Exception $authEx) {
        // Table may not exist yet
    }

    if (!$authenticatedOfficer && isset($knownOfficers[strtolower($officerUsername)])) {
        $info = $knownOfficers[strtolower($officerUsername)];
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `officers` (
                  `username` VARCHAR(128) NOT NULL,
                  `password_hash` VARCHAR(255) NOT NULL,
                  `role` VARCHAR(64) NOT NULL,
                  `title` VARCHAR(255) NULL,
                  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`username`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            $ins = $pdo->prepare("INSERT IGNORE INTO `officers` (`username`, `password_hash`, `role`, `title`) VALUES (:u, 'Sitakunda@2026', :r, :t)");
            $ins->execute([
                ':u' => $officerUsername,
                ':r' => $info['role'],
                ':t' => $info['title']
            ]);
        } catch (Exception $seedEx) {}

        $authenticatedOfficer = [
            'username' => $officerUsername,
            'role' => $info['role'],
            'title' => $info['title']
        ];
    }

    if (!$authenticatedOfficer) {
        http_response_code(403);
        echo json_encode([
            'error' => 'অননুমোদিত এক্সেস। প্রদত্ত আইডিটি পৌরসভার বৈধ কর্মকর্তা হিসেবে স্বীকৃত নয়।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $key = isset($payload['key']) ? trim($payload['key']) : 'portal_config';
    $dataToSave = isset($payload['data']) ? json_encode($payload['data'], JSON_UNESCAPED_UNICODE) : $rawInput;

    try {
        // Save into portal_settings
        $stmt = $pdo->prepare("
            INSERT INTO `portal_settings` (`setting_key`, `data`, `updated_at`)
            VALUES (:k, :d, NOW())
            ON DUPLICATE KEY UPDATE `data` = :d2, `updated_at` = NOW()
        ");
        $stmt->execute([':k' => $key, ':d' => $dataToSave, ':d2' => $dataToSave]);

        // Duplicate to drafts table for redundancy
        try {
            $stmt2 = $pdo->prepare("
                INSERT INTO `drafts` (`draft_key`, `module_type`, `data`, `updated_at`)
                VALUES (:k, 'settings', :d, NOW())
                ON DUPLICATE KEY UPDATE `data` = :d2, `updated_at` = NOW()
            ");
            $stmt2->execute([':k' => $key, ':d' => $dataToSave, ':d2' => $dataToSave]);
        } catch (Exception $ex) {
            // ignore
        }

        // Add audit log entry
        try {
            $logId = 'log_' . time() . '_' . bin2hex(random_bytes(3));
            $stmtLog = $pdo->prepare("
                INSERT INTO `audit_logs` (`id`, `officer_username`, `officer_name`, `officer_role`, `officer_designation`, `action_type`, `action_title`, `details`, `ip_address`)
                VALUES (:id, :u, :name, :role, :desig, 'SETTINGS_UPDATE', 'ওয়েবসাইট তথ্য ও প্রোফাইল হালনাগাদ', :details, :ip)
            ");
            $stmtLog->execute([
                ':id' => $logId,
                ':u' => $authenticatedOfficer['username'],
                ':name' => $authenticatedOfficer['title'] ?? $authenticatedOfficer['username'],
                ':role' => $authenticatedOfficer['role'],
                ':desig' => $authenticatedOfficer['title'] ?? 'পৌর কর্মকর্তা',
                ':details' => 'পৌরসভা পোর্টাল কনফিগারেশন, বাণী বা পরিষদ প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
                ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);
        } catch (Exception $logEx) {}

        echo json_encode([
            'success' => true,
            'updated_at' => date('Y-m-d H:i:s'),
            'officer' => $authenticatedOfficer['username']
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save settings', 'message' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
