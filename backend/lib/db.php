<?php
require_once __DIR__ . '/QueryLogger.php';
require_once __DIR__ . '/DebugPDO.php';

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'DBMS_project');
// Set APP_ENV=production in your server environment to disable query logging.
define('APP_ENV', getenv('APP_ENV') ?: 'development');

// Returns a singleton PDO (or DebugPDO in dev) for the current request lifecycle.
function getDB(): PDO {
    static $instance = null;
    if ($instance !== null) return $instance;

    $dsn  = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $opts = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    $instance = (APP_ENV !== 'production')
        ? new DebugPDO($dsn, DB_USER, DB_PASS, $opts)
        : new PDO($dsn, DB_USER, DB_PASS, $opts);

    return $instance;
}
