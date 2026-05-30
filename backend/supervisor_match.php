<?php
// ============================================================
// EduMatch — Supervisor Matching Endpoint
// GET /backend/supervisor_match.php?student_id=1
// SQL operations: CROSS JOIN, INNER JOIN, NOT IN (subquery),
//   WHERE, ORDER BY, LIMIT, AS, CASE WHEN
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/lib/db.php';

$student_id = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

try {
    $pdo = getDB();

    // ── Query: CROSS JOIN all faculty × target student, then score & rank ──
    //
    // CROSS JOIN: generates every faculty-student pair; WHERE s.student_id = :sid
    //             collapses this to one row per faculty for the given student.
    // INNER JOIN: resolves faculty → Users for the supervisor's name.
    // CASE WHEN:  research-interest keyword match adds 35 pts to score.
    // NOT IN:     excludes the student's already-assigned supervisor so they
    //             are not suggested again as a new match.
    // ORDER BY match_score DESC + LIMIT 5: returns top-5 recommendations.
    $stmt = $pdo->prepare("
        SELECT
            f.faculty_id,
            u.name                                      AS supervisor_name,
            f.research_focus                            AS expertise,
            f.quota,
            f.current_student_count,
            (f.quota - f.current_student_count)         AS slots_available,
            ROUND(
                (s.cgpa * 10) +
                (CASE WHEN f.research_focus LIKE CONCAT('%', s.research_interest, '%')
                      THEN 35 ELSE 0 END)
            , 1)                                        AS match_score
        FROM   Faculty f
        CROSS  JOIN Students s
        INNER  JOIN Users u ON f.user_id = u.user_id
        WHERE  s.student_id = :sid
          AND  f.current_student_count < f.quota
          AND  f.faculty_id NOT IN (
                   SELECT assigned_supervisor_id
                   FROM   Students
                   WHERE  student_id = :sid2
                     AND  assigned_supervisor_id IS NOT NULL
               )
        ORDER  BY match_score DESC
        LIMIT  5
    ");
    $stmt->execute([':sid' => $student_id, ':sid2' => $student_id]);
    $supervisors = $stmt->fetchAll();

    foreach ($supervisors as &$sv) {
        $sv['faculty_id']            = (int)$sv['faculty_id'];
        $sv['quota']                 = (int)$sv['quota'];
        $sv['current_student_count'] = (int)$sv['current_student_count'];
        $sv['slots_available']       = (int)$sv['slots_available'];
        $sv['match_score']           = (float)$sv['match_score'];
    }
    unset($sv);

    http_response_code(200);
    echo json_encode([
        "success"     => true,
        "supervisors" => $supervisors,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
