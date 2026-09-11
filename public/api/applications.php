<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Officer-Username');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

@ini_set('upload_max_filesize', '64M');
@ini_set('post_max_size', '64M');
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', '300');

$pdo = getDbConnection();

// Ensure applications table exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `applications` (
          `id` VARCHAR(64) NOT NULL,
          `module_type` VARCHAR(32) NOT NULL DEFAULT 'demarcation',
          `form_no` VARCHAR(64) NULL,
          `tracking_id` VARCHAR(64) NOT NULL,
          `applicant_name` VARCHAR(255) NULL,
          `applicant_phone` VARCHAR(32) NULL,
          `status` VARCHAR(64) NOT NULL DEFAULT 'submitted',
          `data` LONGTEXT NOT NULL,
          `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          INDEX `idx_tracking` (`tracking_id`),
          INDEX `idx_module` (`module_type`),
          INDEX `idx_phone` (`applicant_phone`),
          INDEX `idx_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($pdo);
        break;
    case 'POST':
        handlePost($pdo);
        break;
    case 'PUT':
    case 'PATCH':
        handlePut($pdo);
        break;
    case 'DELETE':
        handleDelete($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function toEnglishDigitsPhp($str) {
    $banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    $englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return str_replace($banglaDigits, $englishDigits, (string)$str);
}

function handleGet($pdo) {
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;
    $trackingId = isset($_GET['tracking_id']) ? trim($_GET['tracking_id']) : null;
    $query = isset($_GET['q']) ? trim($_GET['q']) : (isset($_GET['search']) ? trim($_GET['search']) : null);
    $module = isset($_GET['module']) ? trim($_GET['module']) : null;

    $lookup = $id ?: ($trackingId ?: $query);

    if ($lookup) {
        $lookupRaw = trim($lookup);
        $lookupEn = toEnglishDigitsPhp($lookupRaw);
        $cleanDigits = preg_replace('/[^0-9]/', '', $lookupEn);
        if (substr($cleanDigits, 0, 2) === '88') {
            $cleanDigits = substr($cleanDigits, 2);
        }

        // 1. Direct and LIKE match across columns
        $sql = "SELECT data FROM applications 
                WHERE id = :raw 
                   OR tracking_id = :raw 
                   OR form_no = :raw 
                   OR applicant_phone = :raw 
                   OR id = :en 
                   OR tracking_id = :en 
                   OR form_no = :en 
                   OR applicant_phone = :en";
        
        $params = [
            ':raw' => $lookupRaw,
            ':en' => $lookupEn,
        ];

        if ($cleanDigits && strlen($cleanDigits) >= 5) {
            $sql .= " OR applicant_phone LIKE :phoneLike OR id LIKE :digitsLike OR form_no LIKE :digitsLike";
            $params[':phoneLike'] = '%' . $cleanDigits . '%';
            $params[':digitsLike'] = '%' . $cleanDigits . '%';
        }

        $sql .= " ORDER BY created_at DESC LIMIT 1";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        
        if ($row) {
            echo $row['data'];
            return;
        }

        // 2. Fallback search inside JSON data (by both raw and English digits)
        $likeQueryRaw = '%' . $lookupRaw . '%';
        $likeQueryEn = '%' . $lookupEn . '%';
        $sqlFallback = "SELECT data FROM applications 
                        WHERE data LIKE :likeRaw OR data LIKE :likeEn 
                        ORDER BY created_at DESC LIMIT 1";
        $stmtFallback = $pdo->prepare($sqlFallback);
        $stmtFallback->execute([':likeRaw' => $likeQueryRaw, ':likeEn' => $likeQueryEn]);
        $fallbackRow = $stmtFallback->fetch();
        if ($fallbackRow) {
            echo $fallbackRow['data'];
            return;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Application not found', 'lookup' => $lookupRaw, 'lookupEn' => $lookupEn]);
        return;
    }

    $sql = "SELECT data FROM applications";
    $params = [];
    if ($module) {
        $sql .= " WHERE module_type = :module";
        $params[':module'] = $module;
    }
    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $results = [];
    foreach ($rows as $row) {
        $decoded = json_decode($row, true);
        if ($decoded) {
            $results[] = $decoded;
        }
    }

    echo json_encode($results, JSON_UNESCAPED_UNICODE);
}

/**
 * Helper to extract any Base64 attachments anywhere in the application,
 * save them as real physical files in /uploads/, and replace the base64 URL with /uploads/...
 */
function extractSingleBase64File($fileData, $origName, $uploadDir, $basePath) {
    if (!$fileData || !is_string($fileData) || strpos($fileData, 'data:') !== 0 || strpos($fileData, ';base64,') === false) {
        return null;
    }
    $parts = explode(';base64,', $fileData);
    $meta = $parts[0];
    $base64Data = $parts[1] ?? '';

    $ext = 'pdf';
    if (strpos($meta, 'image/jpeg') !== false || strpos($meta, 'image/jpg') !== false) {
        $ext = 'jpg';
    } elseif (strpos($meta, 'image/png') !== false) {
        $ext = 'png';
    } elseif (strpos($meta, 'image/webp') !== false) {
        $ext = 'webp';
    }

    $binary = base64_decode($base64Data);
    if ($binary === false || strlen($binary) === 0) {
        return null;
    }

    $cleanPrefix = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($origName, PATHINFO_FILENAME));
    $cleanPrefix = substr($cleanPrefix ?: 'doc', 0, 30);
    $uniqueName = 'doc_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $cleanPrefix . '.' . $ext;
    $targetPath = $uploadDir . '/' . $uniqueName;

    if (file_put_contents($targetPath, $binary) !== false) {
        return [
            'fileUrl' => $basePath . '/uploads/' . $uniqueName,
            'fileSize' => strlen($binary),
            'fileName' => $cleanPrefix . '.' . $ext,
        ];
    }
    return null;
}

function recursiveExtractBase64(&$data, $uploadDir, $basePath) {
    if (!is_array($data)) return;

    if (isset($data['fileUrl']) && is_string($data['fileUrl']) && strpos($data['fileUrl'], 'data:') === 0) {
        $origName = $data['fileName'] ?? ($data['docTitle'] ?? 'document');
        $res = extractSingleBase64File($data['fileUrl'], $origName, $uploadDir, $basePath);
        if ($res) {
            $data['fileUrl'] = $res['fileUrl'];
            $data['fileSize'] = $res['fileSize'];
        }
    }
    if (isset($data['dataUrl']) && is_string($data['dataUrl']) && strpos($data['dataUrl'], 'data:') === 0) {
        $origName = $data['fileName'] ?? 'document';
        $res = extractSingleBase64File($data['dataUrl'], $origName, $uploadDir, $basePath);
        if ($res) {
            $data['dataUrl'] = $res['fileUrl'];
            if (!isset($data['fileUrl'])) {
                $data['fileUrl'] = $res['fileUrl'];
            }
        }
    }

    foreach ($data as &$item) {
        if (is_array($item)) {
            recursiveExtractBase64($item, $uploadDir, $basePath);
        }
    }
}

function processAndExtractBase64Documents(&$payload) {
    if (!is_array($payload)) return;

    $uploadDir = dirname(__DIR__) . '/uploads';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0777, true);
    }
    @chmod($uploadDir, 0777);

    $scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME'] ?? ''));
    $basePath = ($scriptDir === '/' || $scriptDir === '\\' || $scriptDir === '.' || empty($scriptDir)) ? '' : rtrim(str_replace('\\', '/', $scriptDir), '/');

    recursiveExtractBase64($payload, $uploadDir, $basePath);
}

function handlePost($pdo) {
    try {
        $rawInput = file_get_contents('php://input');
        $payload = json_decode($rawInput, true);

        if (!$payload || !isset($payload['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid application payload', 'receivedLength' => strlen($rawInput)]);
            return;
        }

        // Automatically convert any heavy inline Base64 documents to real files in /uploads/
        processAndExtractBase64Documents($payload);

        $id = $payload['id'];
        $moduleType = isset($payload['moduleType']) ? $payload['moduleType'] : (isset($_GET['module']) ? $_GET['module'] : 'demarcation');
        $formNo = isset($payload['formNo']) ? $payload['formNo'] : (isset($payload['formNumber']) ? $payload['formNumber'] : null);
        $trackingId = isset($payload['trackingId']) ? $payload['trackingId'] : (isset($payload['id']) ? $payload['id'] : $id);
        
        // Extract applicant info across Demarcation, Building, and Road Cutting modules
        $applicantName = null;
        $applicantPhone = null;
        if (isset($payload['siteLocation']) && is_array($payload['siteLocation'])) {
            $applicantName = $payload['siteLocation']['applicantName'] ?? null;
            $applicantPhone = $payload['siteLocation']['applicantMobile'] ?? null;
        } elseif (isset($payload['applicant']) && is_array($payload['applicant'])) {
            $applicantName = $payload['applicant']['nameBangla'] ?? $payload['applicant']['nameEnglish'] ?? null;
            $applicantPhone = $payload['applicant']['mobile'] ?? null;
        } elseif (isset($payload['applicantName'])) {
            $applicantName = $payload['applicantName'];
            $applicantPhone = $payload['applicantMobile'] ?? $payload['applicantPhone'] ?? null;
        } elseif (isset($payload['generalInfo']) && is_array($payload['generalInfo'])) {
            $applicantName = $payload['generalInfo']['applicantNameBangla'] ?? null;
            $applicantPhone = $payload['generalInfo']['applicantMobile'] ?? null;
        }

        // Fallback to landOwners or owners if applicantName still empty
        if (!$applicantName) {
            if (isset($payload['landOwners']) && is_array($payload['landOwners']) && count($payload['landOwners']) > 0) {
                $applicantName = $payload['landOwners'][0]['name'] ?? null;
                if (!$applicantPhone) {
                    $applicantPhone = $payload['landOwners'][0]['mobile'] ?? null;
                }
            } elseif (isset($payload['owners']) && is_array($payload['owners']) && count($payload['owners']) > 0) {
                $applicantName = $payload['owners'][0]['name'] ?? null;
                if (!$applicantPhone) {
                    $applicantPhone = $payload['owners'][0]['mobile'] ?? null;
                }
            }
        }

        $status = $payload['status'] ?? 'submitted';
        $dataJson = json_encode($payload, JSON_UNESCAPED_UNICODE);

        $sql = "INSERT INTO applications (id, module_type, form_no, tracking_id, applicant_name, applicant_phone, status, data, created_at)
                VALUES (:id, :module_type, :form_no, :tracking_id, :applicant_name, :applicant_phone, :status, :data, NOW())
                ON DUPLICATE KEY UPDATE
                    form_no = VALUES(form_no),
                    tracking_id = VALUES(tracking_id),
                    applicant_name = VALUES(applicant_name),
                    applicant_phone = VALUES(applicant_phone),
                    status = VALUES(status),
                    data = VALUES(data),
                    updated_at = NOW()";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':module_type' => $moduleType,
            ':form_no' => $formNo,
            ':tracking_id' => $trackingId,
            ':applicant_name' => $applicantName,
            ':applicant_phone' => $applicantPhone,
            ':status' => $status,
            ':data' => $dataJson,
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $id, 'data' => $payload], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function handlePut($pdo) {
    try {
        $rawInput = file_get_contents('php://input');
        $payload = json_decode($rawInput, true);

        if (!$payload || !isset($payload['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid update payload']);
            return;
        }

        processAndExtractBase64Documents($payload);

        $id = $payload['id'];
        $status = $payload['status'] ?? null;
        $dataJson = json_encode($payload, JSON_UNESCAPED_UNICODE);

        $sql = "UPDATE applications SET data = :data";
        $params = [':id' => $id, ':data' => $dataJson];

        if ($status) {
            $sql .= ", status = :status";
            $params[':status'] = $status;
        }
        $sql .= ", updated_at = NOW() WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'id' => $id, 'data' => $payload], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleDelete($pdo) {
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM applications WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deletedId' => $id]);
}
