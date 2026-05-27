<?php
// ============================================================
// EduMatch — Job / Internship Posting Endpoint
// POST /backend/post_job.php           { action:"post", ... }
// GET  /backend/post_job.php?action=search&term=Python
// GET  /backend/post_job.php           (action defaults to "search")
// SQL operations: INSERT INTO VALUES, INSERT INTO SELECT,
//   SELECT LIKE, BETWEEN, ORDER BY, LIMIT
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'DBMS_project');

$input  = json_decode(file_get_contents("php://input"), true) ?? [];
$action = trim($input['action'] ?? $_GET['action'] ?? 'search');

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

    // ══════════════════════════════════════════════════════════
    // ACTION: post — INSERT INTO VALUES + INSERT INTO SELECT
    // ══════════════════════════════════════════════════════════
    if ($action === 'post') {

        // Validate required fields
        $company_name    = trim($input['company_name']    ?? '');
        $role_title      = trim($input['role_title']      ?? '');
        $salary          = trim($input['salary']          ?? '0');
        $required_skills = trim($input['required_skills'] ?? '');
        $deadline        = trim($input['deadline']        ?? date('Y-m-d', strtotime('+60 days')));

        if ($company_name === '' || $role_title === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "company_name and role_title are required."]);
            exit();
        }

        // Validate deadline is a valid future date
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadline) || $deadline < date('Y-m-d')) {
            $deadline = date('Y-m-d', strtotime('+60 days'));
        }

        $pdo->beginTransaction();

        // ── Step A: INSERT INTO VALUES — create the internship listing ────────
        $ins = $pdo->prepare("
            INSERT INTO Internships
                (company_name, role_title, salary, required_skills, deadline, status)
            VALUES
                (:cname, :role, :salary, :skills, :deadline, 'open')
        ");
        $ins->execute([
            ':cname'    => $company_name,
            ':role'     => $role_title,
            ':salary'   => $salary,
            ':skills'   => $required_skills,
            ':deadline' => $deadline,
        ]);
        $new_id = (int)$pdo->lastInsertId();

        // ── Step B: INSERT INTO SELECT ────────────────────────────────────────
        // Broadcasts a notification message about the new listing to all
        // students in the system. The sender is resolved via a subquery
        // (first admin user). This demonstrates INSERT INTO SELECT: the rows
        // being inserted are entirely derived from a SELECT statement.
        $notify = $pdo->prepare("
            INSERT INTO Messages (sender_id, receiver_id, body, sent_at)
            SELECT
                (SELECT user_id FROM Users WHERE role = 'admin' LIMIT 1),
                u.user_id,
                CONCAT('New internship posted: ',
                       i.role_title, ' at ', i.company_name,
                       ' | Skills: ', i.required_skills,
                       ' | Deadline: ', i.deadline),
                NOW()
            FROM  Internships i
            JOIN  Users       u ON u.role = 'student'
            WHERE i.internship_id = :new_id
            LIMIT 10
        ");
        $notify->execute([':new_id' => $new_id]);
        $notified_count = (int)$notify->rowCount();

        $pdo->commit();

        http_response_code(201);
        echo json_encode([
            "success"         => true,
            "message"         => "Internship posted and students notified.",
            "internship_id"   => $new_id,
            "notified_count"  => $notified_count,
        ], JSON_PRETTY_PRINT);

    // ══════════════════════════════════════════════════════════
    // ACTION: search (default) — SELECT LIKE + BETWEEN + ORDER BY + LIMIT
    // ══════════════════════════════════════════════════════════
    } else {

        // Sanitise search term — strip extra % or _ characters that could
        // distort LIKE matching, then wrap in wildcards.
        $raw_term = $input['term'] ?? $_GET['term'] ?? '';
        $term     = '%' . str_replace(['%', '_'], ['\%', '\_'], trim($raw_term)) . '%';

        // BETWEEN CURDATE() … +365 days: covers all seed data deadlines
        // (max 97 days out) while still demonstrating the BETWEEN operator.
        // Named params :term and :term2 are distinct names for the same
        // value — required because ATTR_EMULATE_PREPARES is false and PDO
        // native statements cannot reuse the same name twice in one query.
        $stmt = $pdo->prepare("
            SELECT internship_id,
                   company_name,
                   role_title,
                   salary,
                   required_skills,
                   deadline,
                   status
            FROM   Internships
            WHERE  (role_title      LIKE :term
                OR  required_skills LIKE :term2)
              AND  status   = 'open'
              AND  deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 365 DAY)
            ORDER  BY deadline ASC
            LIMIT  10
        ");
        $stmt->execute([':term' => $term, ':term2' => $term]);
        $results = $stmt->fetchAll();

        foreach ($results as &$r) {
            $r['internship_id'] = (int)$r['internship_id'];
        }
        unset($r);

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "count"   => count($results),
            "results" => $results,
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
