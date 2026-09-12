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
        $rawPostCheck = @file_get_contents('php://input');
        $jsonPostCheck = $rawPostCheck ? @json_decode($rawPostCheck, true) : [];
        $isPostDelete = (isset($_GET['action']) && $_GET['action'] === 'delete')
            || (isset($jsonPostCheck['action']) && $jsonPostCheck['action'] === 'delete')
            || (isset($_POST['action']) && $_POST['action'] === 'delete')
            || isset($_GET['clear_all'])
            || isset($jsonPostCheck['clear_all']);
        if ($isPostDelete) {
            handleDelete($pdo);
        } else {
            handlePost($pdo);
        }
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

    $sql = "SELECT id, module_type, data FROM applications WHERE id NOT LIKE 'settings_%' AND id NOT LIKE 'draft_%' AND id NOT LIKE 'MEDIA-%'";
    $params = [];
    if ($module) {
        if ($module === 'demarcation') {
            $sql .= " AND (module_type = 'demarcation' OR (module_type IS NULL AND (id LIKE 'SKM-DEM-%' OR id LIKE 'APP-%')) OR id LIKE 'SKM-DEM-%' OR id LIKE 'APP-%')";
        } else if ($module === 'building') {
            $sql .= " AND (module_type = 'building' OR id LIKE 'SKM-BLD-%' OR id LIKE 'SKM-BCA-%')";
        } else if ($module === 'road_cutting') {
            $sql .= " AND (module_type = 'road_cutting' OR id LIKE 'SKM-RC-%')";
        } else {
            $sql .= " AND module_type = :module";
            $params[':module'] = $module;
        }
    }
    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $results = [];
    foreach ($rows as $row) {
        $decoded = json_decode($row['data'], true);
        if ($decoded && is_array($decoded)) {
            // Ensure ID is present from table row if not in JSON
            if (empty($decoded['id']) && !empty($row['id'])) {
                $decoded['id'] = $row['id'];
            }
            
            // Only include actual applications, not raw settings or media
            $hasId = !empty($decoded['id']) && (strpos((string)$decoded['id'], 'SKM-') === 0 || strpos((string)$decoded['id'], 'APP-') === 0);
            $hasAppFields = isset($decoded['proposedConstruction']) || isset($decoded['schedule']) || isset($decoded['applicant']) || isset($decoded['roadLocation']);
            
            if ($hasId || $hasAppFields) {
                $results[] = $decoded;
            }
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
    $cleanPrefix = trim(preg_replace('/_+/', '_', $cleanPrefix), '_');
    if (empty($cleanPrefix)) {
        $cleanPrefix = 'doc';
    }
    $cleanPrefix = substr($cleanPrefix, 0, 30);
    $uniqueName = 'doc_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $cleanPrefix . '.' . $ext;
    $targetPath = $uploadDir . '/' . $uniqueName;

    if (file_put_contents($targetPath, $binary) !== false) {
        @chmod($targetPath, 0644);
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

    $possibleDirs = [
        dirname(__DIR__) . '/uploads',
        __DIR__ . '/../uploads',
        ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/uploads',
        dirname(__DIR__) . '/public/uploads',
    ];

    $uploadDir = null;
    foreach ($possibleDirs as $dir) {
        if (!$dir) continue;
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
        if (is_dir($dir)) {
            @chmod($dir, 0777);
            if (is_writable($dir)) {
                $uploadDir = realpath($dir) ?: $dir;
                break;
            }
        }
    }

    if (!$uploadDir) {
        $uploadDir = dirname(__DIR__) . '/uploads';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0777, true);
        }
        @chmod($uploadDir, 0777);
    }

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
            echo json_encode([
                'error' => 'Invalid application payload: ' . json_last_error_msg(),
                'receivedLength' => strlen($rawInput)
            ]);
            return;
        }

        // Automatically convert any heavy inline Base64 documents to real files in /uploads/
        try {
            processAndExtractBase64Documents($payload);
        } catch (Exception $e) {}

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
    $rawBody = @file_get_contents('php://input');
    $bodyJson = $rawBody ? @json_decode($rawBody, true) : [];

    $id = isset($_GET['id']) ? trim($_GET['id']) : (isset($bodyJson['id']) ? trim($bodyJson['id']) : null);
    $clearAll = isset($_GET['clear_all']) ? trim($_GET['clear_all']) : (isset($bodyJson['clear_all']) ? $bodyJson['clear_all'] : null);
    $module = isset($_GET['module']) ? trim($_GET['module']) : (isset($bodyJson['module']) ? trim($bodyJson['module']) : null);

    if ($clearAll === 'true' || $clearAll === '1' || $clearAll === true || $clearAll === 1) {
        if ($module) {
            if ($module === 'demarcation') {
                $stmt = $pdo->prepare("DELETE FROM applications WHERE module_type = 'demarcation' OR module_type IS NULL OR module_type = '' OR id LIKE 'SKM-DEM-%' OR id LIKE 'APP-%'");
                $stmt->execute();
            } else if ($module === 'building') {
                $stmt = $pdo->prepare("DELETE FROM applications WHERE module_type = 'building' OR id LIKE 'SKM-BLD-%' OR id LIKE 'SKM-BCA-%'");
                $stmt->execute();
            } else if ($module === 'road_cutting') {
                $stmt = $pdo->prepare("DELETE FROM applications WHERE module_type = 'road_cutting' OR id LIKE 'SKM-RC-%'");
                $stmt->execute();
            } else {
                $stmt = $pdo->prepare("DELETE FROM applications WHERE module_type = :module");
                $stmt->execute([':module' => $module]);
            }
        } else {
            $pdo->exec("DELETE FROM applications");
        }
        echo json_encode(['success' => true, 'cleared' => true]);
        return;
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        return;
    }

    try {
        $cleanId = strtolower(trim($id));
        $enId = toEnglishDigitsPhp($cleanId);
        $like1 = '%' . $cleanId . '%';
        $like2 = '%' . $enId . '%';
        $stmt = $pdo->prepare("DELETE FROM applications 
            WHERE LOWER(TRIM(id)) = :id1 
               OR LOWER(TRIM(id)) = :enId1
               OR LOWER(TRIM(tracking_id)) = :id2 
               OR LOWER(TRIM(tracking_id)) = :enId2
               OR LOWER(TRIM(form_no)) = :id3 
               OR LOWER(TRIM(form_no)) = :enId3
               OR (data LIKE :like1)
               OR (data LIKE :like2)");
        $stmt->execute([
            ':id1' => $cleanId,
            ':enId1' => $enId,
            ':id2' => $cleanId,
            ':enId2' => $enId,
            ':id3' => $cleanId,
            ':enId3' => $enId,
            ':like1' => $like1,
            ':like2' => $like2,
        ]);
        echo json_encode(['success' => true, 'deletedId' => $id]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Delete failed: ' . $e->getMessage()]);
    }
}
