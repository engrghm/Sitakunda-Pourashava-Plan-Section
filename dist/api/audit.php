<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDbConnection();

// Ensure audit_logs table exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `audit_logs` (
          `id` VARCHAR(64) NOT NULL,
          `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `officer_username` VARCHAR(128) NOT NULL,
          `officer_name` VARCHAR(255) NULL,
          `officer_role` VARCHAR(64) NULL,
          `officer_designation` VARCHAR(255) NULL,
          `action_type` VARCHAR(64) NOT NULL,
          `action_title` VARCHAR(255) NOT NULL,
          `target_id` VARCHAR(64) NULL,
          `applicant_name` VARCHAR(255) NULL,
          `details` TEXT NULL,
          `ip_address` VARCHAR(64) NULL,
          `metadata` LONGTEXT NULL,
          PRIMARY KEY (`id`),
          INDEX `idx_officer` (`officer_username`),
          INDEX `idx_target` (`target_id`),
          INDEX `idx_timestamp` (`timestamp`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $limit = isset($_GET['limit']) ? min(intval($_GET['limit']), 500) : 200;
    $stmt = $pdo->prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT :limit");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $logs = [];
    foreach ($rows as $r) {
        $meta = $r['metadata'] ? json_decode($r['metadata'], true) : null;
        $logs[] = [
            'id' => $r['id'],
            'timestamp' => $r['timestamp'],
            'officerUsername' => $r['officer_username'],
            'officerName' => $r['officer_name'],
            'officerRole' => $r['officer_role'],
            'officerDesignation' => $r['officer_designation'],
            'actionType' => $r['action_type'],
            'actionTitle' => $r['action_title'],
            'targetId' => $r['target_id'],
            'applicantName' => $r['applicant_name'],
            'details' => $r['details'],
            'ipAddress' => $r['ip_address'],
            'metadata' => $meta
        ];
    }
    echo json_encode($logs, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $p = json_decode($rawInput, true) ?: [];

    $id = $p['id'] ?? ('audit-' . round(microtime(true) * 1000) . '-' . rand(1000, 9999));
    $timestamp = $p['timestamp'] ?? date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    $stmt = $pdo->prepare("INSERT INTO audit_logs 
        (id, timestamp, officer_username, officer_name, officer_role, officer_designation, action_type, action_title, target_id, applicant_name, details, ip_address, metadata)
        VALUES 
        (:id, :ts, :ou, :on, :or, :od, :at, :ati, :ti, :an, :det, :ip, :meta)");

    $stmt->execute([
        ':id' => $id,
        ':ts' => $timestamp,
        ':ou' => $p['officerUsername'] ?? 'system',
        ':on' => $p['officerName'] ?? 'System Admin',
        ':or' => $p['officerRole'] ?? 'super_admin',
        ':od' => $p['officerDesignation'] ?? 'সীতাকুণ্ড পৌরসভা',
        ':at' => $p['actionType'] ?? 'update',
        ':ati' => $p['actionTitle'] ?? 'কার্যকলাপ সম্পন্ন',
        ':ti' => $p['targetId'] ?? null,
        ':an' => $p['applicantName'] ?? null,
        ':det' => $p['details'] ?? '',
        ':ip' => $ip,
        ':meta' => isset($p['metadata']) ? json_encode($p['metadata'], JSON_UNESCAPED_UNICODE) : null,
    ]);

    echo json_encode(['success' => true, 'id' => $id]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
