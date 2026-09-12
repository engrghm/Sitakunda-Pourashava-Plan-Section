<?php
// Hostinger MySQL Database Configuration
// Fill in your Hostinger Database credentials from hPanel -> Databases -> Management

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Officer-Username');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Credentials (Set your Hostinger DB credentials here)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u877510431_Golam_Hyder');
define('DB_USER', getenv('DB_USER') ?: 'u877510431_Masum');
define('DB_PASS', getenv('DB_PASS') ?: 'Sharmin@354990');

function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Database connection failed',
            'message' => $e->getMessage(),
            'hint' => 'Please check DB_NAME, DB_USER, and DB_PASS in public/api/config.php'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
