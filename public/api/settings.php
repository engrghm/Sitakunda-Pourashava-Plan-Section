<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDbConnection();

// Ensure settings, drafts, and applications fallback tables exist for persistent website customization
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `portal_settings` (
            `setting_key` VARCHAR(64) NOT NULL,
            `data` LONGTEXT NOT NULL,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`setting_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {}

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `drafts` (
            `draft_key` VARCHAR(64) NOT NULL,
            `module_type` VARCHAR(32) NOT NULL DEFAULT 'settings',
            `data` LONGTEXT NOT NULL,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`draft_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $key = isset($_GET['key']) ? trim($_GET['key']) : 'portal_config';
    
    // 1. Try portal_settings table first
    try {
        $stmt = $pdo->prepare("SELECT `data` FROM `portal_settings` WHERE `setting_key` = :k LIMIT 1");
        $stmt->execute([':k' => $key]);
        $row = $stmt->fetch();
        if ($row && isset($row['data']) && $row['data'] !== '') {
            echo $row['data'];
            exit;
        }
    } catch (Exception $ex1) {}

    // 2. Try applications table fallback
    try {
        $stmtApp = $pdo->prepare("SELECT `data` FROM `applications` WHERE `id` = :id LIMIT 1");
        $stmtApp->execute([':id' => 'settings_' . $key]);
        $rowApp = $stmtApp->fetch();
        if ($rowApp && isset($rowApp['data']) && $rowApp['data'] !== '') {
            echo $rowApp['data'];
            exit;
        }
    } catch (Exception $exApp) {}

    // 3. Fallback to drafts table
    try {
        $stmt2 = $pdo->prepare("SELECT `data` FROM `drafts` WHERE `draft_key` = :k LIMIT 1");
        $stmt2->execute([':k' => $key]);
        $row2 = $stmt2->fetch();
        if ($row2 && isset($row2['data']) && $row2['data'] !== '') {
            echo $row2['data'];
            exit;
        }
    } catch (Exception $ex2) {}

    echo json_encode(null);
    exit;
}

// Ensure large payloads (like configs with notices and uploads) are supported
@ini_set('post_max_size', '64M');
@ini_set('upload_max_filesize', '64M');
@ini_set('memory_limit', '256M');

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

    $officerUsername = trim($payload['officer_username'] ?? $_SERVER['HTTP_X_OFFICER_USERNAME'] ?? 'admin.sitakunda');
    if (!$officerUsername) {
        $officerUsername = 'admin.sitakunda';
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

    $officerRole = trim($payload['officer_role'] ?? 'super_admin');
    $officerTitle = 'পৌর কর্মকর্তা';
    if (isset($knownOfficers[strtolower($officerUsername)])) {
        $officerRole = $knownOfficers[strtolower($officerUsername)]['role'];
        $officerTitle = $knownOfficers[strtolower($officerUsername)]['title'];
    }

    $authenticatedOfficer = [
        'username' => $officerUsername,
        'role' => $officerRole,
        'title' => $officerTitle
    ];

    $key = isset($payload['key']) ? trim($payload['key']) : 'portal_config';

    // Extract any base64 images (such as council member photos or leader photo) to /uploads/
    if (isset($payload['data']) && is_array($payload['data'])) {
        $uploadDir = dirname(__DIR__) . '/uploads';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0777, true);
        }
        @chmod($uploadDir, 0777);

        $scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME'] ?? ''));
        $basePath = ($scriptDir === '/' || $scriptDir === '\\' || $scriptDir === '.' || empty($scriptDir)) ? '' : rtrim(str_replace('\\', '/', $scriptDir), '/');

        $extractPhoto = function($fileData, $origName) use ($uploadDir, $basePath) {
            if (!$fileData || !is_string($fileData) || strpos($fileData, 'data:') !== 0 || strpos($fileData, ';base64,') === false) {
                return null;
            }
            $parts = explode(';base64,', $fileData);
            $meta = $parts[0];
            $base64Data = $parts[1] ?? '';

            $ext = 'jpg';
            if (strpos($meta, 'image/png') !== false) {
                $ext = 'png';
            } elseif (strpos($meta, 'image/webp') !== false) {
                $ext = 'webp';
            } elseif (strpos($meta, 'pdf') !== false) {
                $ext = 'pdf';
            }

            $binary = base64_decode($base64Data);
            if ($binary === false || strlen($binary) === 0) {
                return null;
            }

            $cleanPrefix = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($origName, PATHINFO_FILENAME));
            $cleanPrefix = substr($cleanPrefix ?: 'photo', 0, 30);
            $uniqueName = 'img_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $cleanPrefix . '.' . $ext;
            $targetPath = $uploadDir . '/' . $uniqueName;

            if (file_put_contents($targetPath, $binary) !== false) {
                return $basePath . '/uploads/' . $uniqueName;
            }
            return null;
        };

        $sanitizeSettings = function(&$node) use (&$sanitizeSettings, $extractPhoto) {
            if (!is_array($node)) return;
            if (isset($node['imageUrl']) && is_string($node['imageUrl']) && strpos($node['imageUrl'], 'data:') === 0) {
                $savedUrl = $extractPhoto($node['imageUrl'], $node['name'] ?? 'council_photo');
                if ($savedUrl) $node['imageUrl'] = $savedUrl;
            }
            if (isset($node['leaderImageUrl']) && is_string($node['leaderImageUrl']) && strpos($node['leaderImageUrl'], 'data:') === 0) {
                $savedUrl = $extractPhoto($node['leaderImageUrl'], 'administrator_photo');
                if ($savedUrl) $node['leaderImageUrl'] = $savedUrl;
            }
            if (isset($node['fileUrl']) && is_string($node['fileUrl']) && strpos($node['fileUrl'], 'data:') === 0) {
                $savedUrl = $extractPhoto($node['fileUrl'], $node['fileName'] ?? 'notice_file');
                if ($savedUrl) $node['fileUrl'] = $savedUrl;
            }
            if (isset($node['thumbnailUrl']) && is_string($node['thumbnailUrl']) && strpos($node['thumbnailUrl'], 'data:') === 0) {
                $savedUrl = $extractPhoto($node['thumbnailUrl'], $node['title'] ?? 'media_thumb');
                if ($savedUrl) $node['thumbnailUrl'] = $savedUrl;
            }
            if (isset($node['url']) && is_string($node['url']) && strpos($node['url'], 'data:') === 0) {
                $savedUrl = $extractPhoto($node['url'], $node['title'] ?? 'media_item');
                if ($savedUrl) $node['url'] = $savedUrl;
            }
            foreach ($node as &$sub) {
                if (is_array($sub)) {
                    $sanitizeSettings($sub);
                }
            }
        };

        $sanitizeSettings($payload['data']);
    }

    $dataToSave = isset($payload['data']) ? json_encode($payload['data'], JSON_UNESCAPED_UNICODE) : $rawInput;

    $savedAtLeastOnce = false;
    $saveErrors = [];

    // 1. Save into portal_settings
    try {
        $stmt = $pdo->prepare("
            INSERT INTO `portal_settings` (`setting_key`, `data`, `updated_at`)
            VALUES (:k, :d, NOW())
            ON DUPLICATE KEY UPDATE `data` = :d2, `updated_at` = NOW()
        ");
        $stmt->execute([':k' => $key, ':d' => $dataToSave, ':d2' => $dataToSave]);
        $savedAtLeastOnce = true;
    } catch (Exception $e1) {
        $saveErrors[] = 'portal_settings: ' . $e1->getMessage();
    }

    // 2. Dual-save into applications table (which is guaranteed to exist on Hostinger!)
    try {
        $stmtApp = $pdo->prepare("
            INSERT INTO `applications` (`id`, `module_type`, `tracking_id`, `data`, `updated_at`)
            VALUES (:id, 'settings', :k, :d, NOW())
            ON DUPLICATE KEY UPDATE `data` = :d2, `updated_at` = NOW()
        ");
        $stmtApp->execute([':id' => 'settings_' . $key, ':k' => $key, ':d' => $dataToSave, ':d2' => $dataToSave]);
        $savedAtLeastOnce = true;
    } catch (Exception $eApp) {
        $saveErrors[] = 'applications: ' . $eApp->getMessage();
    }

    // 3. Duplicate to drafts table for redundancy
    try {
        $stmt2 = $pdo->prepare("
            INSERT INTO `drafts` (`draft_key`, `module_type`, `data`, `updated_at`)
            VALUES (:k, 'settings', :d, NOW())
            ON DUPLICATE KEY UPDATE `data` = :d2, `updated_at` = NOW()
        ");
        $stmt2->execute([':k' => $key, ':d' => $dataToSave, ':d2' => $dataToSave]);
        $savedAtLeastOnce = true;
    } catch (Exception $e2) {}

    if (!$savedAtLeastOnce) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save settings to database', 'details' => implode(' | ', $saveErrors)]);
        exit;
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
            ':details' => 'পৌরসভা পোর্টাল কনফিগারেশন বা গ্যালারি সফলভাবে আপডেট করা হয়েছে।',
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ]);
    } catch (Exception $logEx) {}

    echo json_encode([
        'success' => true,
        'updated_at' => date('Y-m-d H:i:s'),
        'officer' => $authenticatedOfficer['username']
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
