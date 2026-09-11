<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

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

function handleGet($pdo) {
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;
    $trackingId = isset($_GET['tracking_id']) ? trim($_GET['tracking_id']) : null;
    $module = isset($_GET['module']) ? trim($_GET['module']) : null;

    if ($id || $trackingId) {
        $sql = "SELECT data FROM applications WHERE id = :lookup OR tracking_id = :lookup LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':lookup' => $id ?: $trackingId]);
        $row = $stmt->fetch();
        if ($row) {
            echo $row['data'];
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Application not found']);
        }
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

function handlePost($pdo) {
    try {
        $rawInput = file_get_contents('php://input');
        $payload = json_decode($rawInput, true);

        if (!$payload || !isset($payload['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid application payload']);
            return;
        }

        $id = $payload['id'];
        $moduleType = isset($payload['moduleType']) ? $payload['moduleType'] : (isset($_GET['module']) ? $_GET['module'] : 'demarcation');
        $formNo = isset($payload['formNo']) ? $payload['formNo'] : (isset($payload['formNumber']) ? $payload['formNumber'] : null);
        $trackingId = isset($payload['trackingId']) ? $payload['trackingId'] : (isset($payload['id']) ? $payload['id'] : $id);
        
        // Extract applicant info across Demarcation, Building, and Road Cutting modules
        $applicantName = null;
        $applicantPhone = null;
        if (isset($payload['applicant']) && is_array($payload['applicant'])) {
            $applicantName = $payload['applicant']['nameBangla'] ?? $payload['applicant']['nameEnglish'] ?? null;
            $applicantPhone = $payload['applicant']['mobile'] ?? null;
        } elseif (isset($payload['siteLocation']) && is_array($payload['siteLocation'])) {
            $applicantName = $payload['siteLocation']['applicantName'] ?? null;
            $applicantPhone = $payload['siteLocation']['applicantMobile'] ?? null;
        } elseif (isset($payload['applicantName'])) {
            $applicantName = $payload['applicantName'];
            $applicantPhone = $payload['applicantMobile'] ?? $payload['applicantPhone'] ?? null;
        } elseif (isset($payload['generalInfo']) && is_array($payload['generalInfo'])) {
            $applicantName = $payload['generalInfo']['applicantNameBangla'] ?? null;
            $applicantPhone = $payload['generalInfo']['applicantMobile'] ?? null;
        }

        // Fallback to first owner if name still empty
        if (!$applicantName && isset($payload['owners']) && is_array($payload['owners']) && count($payload['owners']) > 0) {
            $applicantName = $payload['owners'][0]['name'] ?? null;
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
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!$payload || !isset($payload['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid update payload']);
        return;
    }

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
