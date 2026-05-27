<?php
// ============================================================
// EduMatch — Connection Health & Diagnostic Endpoint
// GET http://localhost/dbms/backend/index.php
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle browser preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'DBMS_project');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    // ── Table row counts (all 13 tables) ──────────────────────
    $tables = [
        'Universities', 'Users', 'Faculty', 'Students',
        'Projects_Thesis', 'Milestones', 'Internships',
        'Applications', 'Skills', 'Courses',
        'Interviews', 'Alumni_Mentors', 'Messages'
    ];

    $table_counts = [];
    foreach ($tables as $t) {
        $table_counts[$t] = (int) $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
    }

    // ── View accessibility check (all 4 views) ────────────────
    $views = [
        'v_supervisor_load',
        'v_thesis_health',
        'v_blind_applicants',
        'v_internship_matches'
    ];

    $view_counts = [];
    foreach ($views as $v) {
        $view_counts[$v] = (int) $pdo->query("SELECT COUNT(*) FROM `$v`")->fetchColumn();
    }

    // ── Summary totals ────────────────────────────────────────
    $summary = [
        'total_users'        => $table_counts['Users'],
        'total_students'     => $table_counts['Students'],
        'total_faculty'      => $table_counts['Faculty'],
        'total_universities' => $table_counts['Universities'],
        'open_internships'   => (int) $pdo->query(
            "SELECT COUNT(*) FROM Internships WHERE status = 'open' AND deadline >= CURDATE()"
        )->fetchColumn(),
        'active_projects'    => (int) $pdo->query(
            "SELECT COUNT(*) FROM Projects_Thesis WHERE status = 'active'"
        )->fetchColumn(),
        'at_risk_projects'   => (int) $pdo->query(
            "SELECT COUNT(*) FROM Projects_Thesis WHERE status = 'at_risk'"
        )->fetchColumn(),
    ];

    http_response_code(200);
    echo json_encode([
        "status"       => "connected",
        "database"     => DB_NAME,
        "summary"      => $summary,
        "table_counts" => $table_counts,
        "view_counts"  => $view_counts,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => $e->getMessage()
    ]);
}
?>
