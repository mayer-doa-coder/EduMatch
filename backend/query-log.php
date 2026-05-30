<?php
// ============================================================
// EduMatch — Dev-only SQL query log endpoint
// GET    /backend/query-log.php?since=<float>   returns new entries
// DELETE /backend/query-log.php                 clears the log
// Blocked entirely in production via APP_ENV check.
// ============================================================

define('APP_ENV', getenv('APP_ENV') ?: 'development');

if (APP_ENV === 'production') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden in production']);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
// Keep polling fast — no server-side cache.
header("Cache-Control: no-store");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/lib/QueryLogger.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    QueryLogger::clear();
    echo json_encode(['cleared' => true]);
    exit();
}

$since   = isset($_GET['since']) ? (float)$_GET['since'] : 0.0;
$entries = QueryLogger::readSince($since);

echo json_encode(
    ['queries' => $entries],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
