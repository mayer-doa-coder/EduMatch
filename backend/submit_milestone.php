<?php
// ============================================================
// EduMatch — Submit Milestone Endpoint
// POST /backend/submit_milestone.php
// Body JSON: { project_id, milestone_name, due_date, plagiarism_score }
// SQL operations: EXISTS, INSERT INTO VALUES, AVG, IS NOT NULL,
//   UPDATE SET WHERE, CASE WHEN
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "POST method required."]);
    exit();
}

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'DBMS_project');

$data = json_decode(file_get_contents("php://input"), true);

$project_id       = isset($data['project_id'])      ? (int)$data['project_id']        : 0;
$milestone_name   = isset($data['milestone_name'])  ? trim($data['milestone_name'])    : '';
$due_date         = isset($data['due_date'])         ? trim($data['due_date'])          : date('Y-m-d');
$plagiarism_score = isset($data['plagiarism_score']) ? (float)$data['plagiarism_score'] : 0.0;

if (!$project_id || $milestone_name === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "project_id and milestone_name are required."]);
    exit();
}

// Validate date format (Y-m-d)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $due_date)) {
    $due_date = date('Y-m-d');
}

// Clamp plagiarism score to a sensible range
$plagiarism_score = max(0.0, min(100.0, $plagiarism_score));

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

    // ── Step 1: EXISTS — reject if this milestone is already submitted ───────
    // EXISTS(subquery) returns 1 (true) or 0 (false).
    $check = $pdo->prepare("
        SELECT EXISTS(
            SELECT 1 FROM Milestones
            WHERE project_id       = :pid
              AND name             = :mname
              AND submission_date IS NOT NULL
        ) AS already_done
    ");
    $check->execute([':pid' => $project_id, ':mname' => $milestone_name]);
    if ((int)$check->fetch()['already_done'] === 1) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "Milestone already submitted."]);
        exit();
    }

    // ── Steps 2–4 run inside a transaction so INSERT + UPDATE are atomic ─────
    $pdo->beginTransaction();

    // ── Step 2: INSERT INTO VALUES — record the new submission ───────────────
    $insert = $pdo->prepare("
        INSERT INTO Milestones (project_id, name, due_date, submission_date, plagiarism_score)
        VALUES (:pid, :mname, :due, CURDATE(), :pscore)
    ");
    $insert->execute([
        ':pid'    => $project_id,
        ':mname'  => $milestone_name,
        ':due'    => $due_date,
        ':pscore' => $plagiarism_score,
    ]);
    $new_milestone_id = (int)$pdo->lastInsertId();

    // ── Step 3: AVG + IS NOT NULL — recalculate project health score ─────────
    // Averages plagiarism_score only across submitted milestones (IS NOT NULL).
    $avg_stmt = $pdo->prepare("
        SELECT AVG(plagiarism_score) AS avg_plag
        FROM   Milestones
        WHERE  project_id      = :pid
          AND  submission_date IS NOT NULL
    ");
    $avg_stmt->execute([':pid' => $project_id]);
    $avg_plag   = (float)($avg_stmt->fetch()['avg_plag'] ?? 0);
    $new_health = max(0, 100 - (int)round($avg_plag * 2));

    // ── Step 4: UPDATE SET WHERE + CASE WHEN — write new health & status ─────
    // CASE WHEN: drives automatic at_risk flag from health score.
    // Preserves 'completed' status — a finished project should not be
    // flipped back to active/at_risk by a late plagiarism recalculation.
    $update = $pdo->prepare("
        UPDATE Projects_Thesis
        SET    health_score = :score,
               status       = CASE
                                  WHEN status = 'completed' THEN 'completed'
                                  WHEN :score2 < 60         THEN 'at_risk'
                                  ELSE                           'active'
                              END
        WHERE  project_id = :pid
    ");
    $update->execute([
        ':score'  => $new_health,
        ':score2' => $new_health,
        ':pid'    => $project_id,
    ]);

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        "success"           => true,
        "message"           => "Milestone submitted successfully.",
        "milestone_id"      => $new_milestone_id,
        "health_score"      => $new_health,
        "avg_plagiarism"    => round($avg_plag, 2),
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
