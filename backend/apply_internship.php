<?php
// ============================================================
// EduMatch — Internship Application Endpoint
//
// GET  ?student_id=N&action=list
//        → { open_internships[], my_applications[], student_skills }
// GET  ?internship_id=N&action=detail
//        → { internship: { full row } }
// POST body JSON: { action, student_id, internship_id, cv_filename? }
//   action=apply    — creates Application row (stores cv_filename)
//   action=withdraw — deletes Application row
//
// Company notification: applications are visible to the company role
// automatically via notifications.php (it queries Applications JOIN
// Internships WHERE company_name = company user's name), so no separate
// INSERT is needed here.
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

$input      = json_decode(file_get_contents("php://input"), true) ?? [];
$action     = trim($input['action']          ?? $_GET['action']       ?? 'list');
$student_id = (int)($input['student_id']     ?? $_GET['student_id']  ?? 0);
$intern_id  = (int)($input['internship_id']  ?? $_GET['internship_id'] ?? 0);
$cv_filename = trim($input['cv_filename']    ?? '');

// ── action=detail: no student_id required ──────────────────────────────────
if ($action === 'detail') {
    if (!$intern_id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "internship_id required."]);
        exit();
    }
    try {
        $pdo  = getDB();
        $stmt = $pdo->prepare("
            SELECT internship_id, role_title, company_name,
                   salary, required_skills, deadline, status,
                   COALESCE(description, '')        AS description,
                   COALESCE(posting_university, '') AS posting_university
            FROM   Internships
            WHERE  internship_id = :iid
        ");
        $stmt->execute([':iid' => $intern_id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Internship not found."]);
            exit();
        }
        echo json_encode(["success" => true, "internship" => $row]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

// All other actions require student_id
if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

if (in_array($action, ['apply', 'withdraw'], true) && !$intern_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "internship_id required for '$action'."]);
    exit();
}

try {
    $pdo = getDB();

    // ── One-time safe migration: add cv_filename column if missing ─────────
    $col_check = $pdo->query("SHOW COLUMNS FROM Applications LIKE 'cv_filename'")->fetchAll();
    if (empty($col_check)) {
        $pdo->exec("ALTER TABLE Applications ADD COLUMN cv_filename VARCHAR(255) NULL DEFAULT NULL");
    }

    // ══════════════════════════════════════════════════════════
    // ACTION: apply
    // ══════════════════════════════════════════════════════════
    if ($action === 'apply') {

        // Guard: internship must be open
        $open_chk = $pdo->prepare("SELECT status FROM Internships WHERE internship_id = :iid");
        $open_chk->execute([':iid' => $intern_id]);
        $int_row = $open_chk->fetch();
        if (!$int_row) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Internship not found."]);
            exit();
        }
        if ($int_row['status'] !== 'open') {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "This internship is no longer accepting applications."]);
            exit();
        }

        // Prevent duplicate application
        $exists = $pdo->prepare("
            SELECT EXISTS(
                SELECT 1 FROM Applications
                WHERE student_id = :sid AND internship_id = :iid
            ) AS already_applied
        ");
        $exists->execute([':sid' => $student_id, ':iid' => $intern_id]);
        if ((int)$exists->fetch()['already_applied'] === 1) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "You have already applied to this internship."]);
            exit();
        }

        // INSERT — include cv_filename (NULL if not provided)
        $ins = $pdo->prepare("
            INSERT INTO Applications (student_id, internship_id, status, applied_date, cv_filename)
            VALUES (:sid, :iid, 'pending', CURDATE(), :cv)
        ");
        $ins->execute([
            ':sid' => $student_id,
            ':iid' => $intern_id,
            ':cv'  => $cv_filename !== '' ? $cv_filename : null,
        ]);

        http_response_code(201);
        echo json_encode([
            "success"        => true,
            "message"        => "Application submitted successfully.",
            "application_id" => (int)$pdo->lastInsertId(),
        ]);

    // ══════════════════════════════════════════════════════════
    // ACTION: withdraw
    // ══════════════════════════════════════════════════════════
    } elseif ($action === 'withdraw') {

        $app_chk = $pdo->prepare("
            SELECT EXISTS(
                SELECT 1 FROM Applications
                WHERE student_id = :sid AND internship_id = :iid
            ) AS app_exists
        ");
        $app_chk->execute([':sid' => $student_id, ':iid' => $intern_id]);
        if ((int)$app_chk->fetch()['app_exists'] === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No application found to withdraw."]);
            exit();
        }

        $del = $pdo->prepare("
            DELETE FROM Applications
            WHERE student_id = :sid AND internship_id = :iid
        ");
        $del->execute([':sid' => $student_id, ':iid' => $intern_id]);

        echo json_encode(["success" => true, "message" => "Application withdrawn."]);

    // ══════════════════════════════════════════════════════════
    // ACTION: list (default)
    // ══════════════════════════════════════════════════════════
    } else {

        // Student's applied internships
        $list = $pdo->prepare("
            SELECT a.application_id,
                   i.internship_id,  i.role_title,   i.company_name,
                   i.salary,         i.required_skills, i.deadline,
                   a.status,         a.applied_date,
                   COALESCE(a.cv_filename, '') AS cv_filename
            FROM   Applications a
            INNER  JOIN Internships i ON a.internship_id = i.internship_id
            WHERE  a.student_id = :sid
            ORDER  BY a.applied_date DESC
        ");
        $list->execute([':sid' => $student_id]);
        $applications = $list->fetchAll();
        foreach ($applications as &$app) {
            $app['application_id'] = (int)$app['application_id'];
            $app['internship_id']  = (int)$app['internship_id'];
        }
        unset($app);

        // Open internships not yet applied to
        $not_applied = $pdo->prepare("
            SELECT i.internship_id, i.role_title, i.company_name,
                   i.salary, i.required_skills, i.deadline,
                   COALESCE(i.description, '')        AS description,
                   COALESCE(i.posting_university, '') AS posting_university
            FROM   Internships i
            WHERE  i.status = 'open'
              AND  NOT EXISTS (
                       SELECT 1 FROM Applications a
                       WHERE  a.student_id    = :sid
                         AND  a.internship_id = i.internship_id
                   )
            ORDER  BY i.deadline ASC
        ");
        $not_applied->execute([':sid' => $student_id]);
        $available = $not_applied->fetchAll();
        foreach ($available as &$av) {
            $av['internship_id'] = (int)$av['internship_id'];
        }
        unset($av);

        // Student's skills — for client-side match scoring
        $skills_stmt = $pdo->prepare("
            SELECT skill_name FROM Skills WHERE student_id = :sid
        ");
        $skills_stmt->execute([':sid' => $student_id]);
        $student_skills = array_column($skills_stmt->fetchAll(), 'skill_name');

        echo json_encode([
            "success"          => true,
            "my_applications"  => $applications,
            "open_internships" => $available,
            "student_skills"   => $student_skills,
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
