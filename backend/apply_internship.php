<?php
// ============================================================
// EduMatch — Internship Application Endpoint
// GET  /backend/apply_internship.php?student_id=1&action=list
// POST /backend/apply_internship.php
//      Body JSON: { action:"apply"|"withdraw", student_id, internship_id }
// SQL operations: EXISTS, NOT EXISTS, INSERT INTO VALUES,
//   DELETE FROM WHERE, INNER JOIN, BETWEEN, ORDER BY
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

// Accept params from either JSON body (POST) or query string (GET)
$input      = json_decode(file_get_contents("php://input"), true) ?? [];
$action     = trim($input['action']       ?? $_GET['action']       ?? 'list');
$student_id = (int)($input['student_id']  ?? $_GET['student_id']  ?? 0);
$intern_id  = (int)($input['internship_id'] ?? $_GET['internship_id'] ?? 0);

if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

// apply and withdraw require an internship_id
if (in_array($action, ['apply', 'withdraw'], true) && !$intern_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "internship_id is required for action '$action'."]);
    exit();
}

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
    // ACTION: apply
    // ══════════════════════════════════════════════════════════
    if ($action === 'apply') {

        // Guard: internship must be open
        $open_chk = $pdo->prepare("
            SELECT status FROM Internships WHERE internship_id = :iid
        ");
        $open_chk->execute([':iid' => $intern_id]);
        $int_row = $open_chk->fetch();
        if (!$int_row) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Internship not found."]);
            exit();
        }
        if ($int_row['status'] !== 'open') {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Internship is no longer open."]);
            exit();
        }

        // EXISTS — prevent duplicate application
        $exists = $pdo->prepare("
            SELECT EXISTS(
                SELECT 1 FROM Applications
                WHERE student_id    = :sid
                  AND internship_id = :iid
            ) AS already_applied
        ");
        $exists->execute([':sid' => $student_id, ':iid' => $intern_id]);
        if ((int)$exists->fetch()['already_applied'] === 1) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Already applied to this internship."]);
            exit();
        }

        // INSERT INTO VALUES
        $ins = $pdo->prepare("
            INSERT INTO Applications (student_id, internship_id, status, applied_date)
            VALUES (:sid, :iid, 'pending', CURDATE())
        ");
        $ins->execute([':sid' => $student_id, ':iid' => $intern_id]);

        http_response_code(201);
        echo json_encode([
            "success"        => true,
            "message"        => "Application submitted.",
            "application_id" => (int)$pdo->lastInsertId(),
        ], JSON_PRETTY_PRINT);

    // ══════════════════════════════════════════════════════════
    // ACTION: withdraw
    // ══════════════════════════════════════════════════════════
    } elseif ($action === 'withdraw') {

        // Guard: application must exist before deleting
        $app_chk = $pdo->prepare("
            SELECT EXISTS(
                SELECT 1 FROM Applications
                WHERE student_id    = :sid
                  AND internship_id = :iid
            ) AS app_exists
        ");
        $app_chk->execute([':sid' => $student_id, ':iid' => $intern_id]);
        if ((int)$app_chk->fetch()['app_exists'] === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No application found to withdraw."]);
            exit();
        }

        // DELETE FROM WHERE
        $del = $pdo->prepare("
            DELETE FROM Applications
            WHERE student_id    = :sid
              AND internship_id = :iid
        ");
        $del->execute([':sid' => $student_id, ':iid' => $intern_id]);

        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Application withdrawn."], JSON_PRETTY_PRINT);

    // ══════════════════════════════════════════════════════════
    // ACTION: list (default)
    // ══════════════════════════════════════════════════════════
    } else {

        // My applications — INNER JOIN + BETWEEN + ORDER BY
        // BETWEEN CURDATE() … +365 days: shows all upcoming internships
        // within a year window, demonstrating the BETWEEN operator.
        $list = $pdo->prepare("
            SELECT a.application_id,
                   i.internship_id,  i.role_title,   i.company_name,
                   i.salary,         i.required_skills, i.deadline,
                   a.status,         a.applied_date
            FROM   Applications a
            INNER  JOIN Internships i ON a.internship_id = i.internship_id
            WHERE  a.student_id = :sid
              AND  i.deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 365 DAY)
            ORDER  BY a.applied_date DESC
        ");
        $list->execute([':sid' => $student_id]);
        $applications = $list->fetchAll();
        foreach ($applications as &$app) {
            $app['application_id'] = (int)$app['application_id'];
            $app['internship_id']  = (int)$app['internship_id'];
        }
        unset($app);

        // Open internships NOT yet applied to — NOT EXISTS
        $not_applied = $pdo->prepare("
            SELECT i.internship_id, i.role_title, i.company_name,
                   i.salary,        i.required_skills, i.deadline
            FROM   Internships i
            WHERE  i.status = 'open'
              AND  NOT EXISTS (
                       SELECT 1 FROM Applications a
                       WHERE  a.student_id    = :sid
                         AND  a.internship_id = i.internship_id
                   )
            ORDER  BY i.deadline ASC
            LIMIT  10
        ");
        $not_applied->execute([':sid' => $student_id]);
        $available = $not_applied->fetchAll();
        foreach ($available as &$av) {
            $av['internship_id'] = (int)$av['internship_id'];
        }
        unset($av);

        http_response_code(200);
        echo json_encode([
            "success"          => true,
            "my_applications"  => $applications,
            "open_internships" => $available,
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
