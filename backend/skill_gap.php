<?php
// ============================================================
// EduMatch — Skill Gap Analysis Endpoint
// GET /backend/skill_gap.php?student_id=1
// GET /backend/skill_gap.php?student_id=1&internship_id=2
// SQL operations: SELECT DISTINCT, LEFT JOIN, IS NULL,
//   NOT IN (subquery), IN (subquery), Subquery in WHERE,
//   ORDER BY, WHERE, AS
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

$student_id    = isset($_GET['student_id'])    ? (int)$_GET['student_id']    : 0;
$internship_id = isset($_GET['internship_id']) ? (int)$_GET['internship_id'] : 0;

if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

try {
    $pdo = getDB();

    // ── Query 1: Skills the student currently has (with verification status) ──
    $have_stmt = $pdo->prepare("
        SELECT sk.skill_name,
               sk.verified,
               u.name AS verified_by_name
        FROM   Skills sk
        LEFT   JOIN Users u ON sk.verified_by = u.user_id
        WHERE  sk.student_id = :sid
        ORDER  BY sk.verified DESC, sk.skill_name ASC
    ");
    $have_stmt->execute([':sid' => $student_id]);
    $skills_raw = $have_stmt->fetchAll();

    $skills_you_have = [];
    foreach ($skills_raw as $sk) {
        $skills_you_have[] = [
            'skill_name'       => $sk['skill_name'],
            'verified'         => (bool)$sk['verified'],
            'verified_by_name' => $sk['verified_by_name'],
        ];
    }
    // Plain array of skill names used later for PHP-side comparison
    $have_names = array_column($skills_you_have, 'skill_name');

    // ── Query 2: Courses for MISSING skills ─────────────────────────────────
    // LEFT JOIN Courses → Skills: rows where the join produces NULL on the
    // Skills side mean the student has no entry for that skill_tag.
    // NOT IN (subquery) double-confirms the gap (demonstrates both operations).
    // SELECT DISTINCT guards against duplicate course rows.
    // ORDER BY CASE sorts Beginner → Intermediate → Advanced.
    $gap_stmt = $pdo->prepare("
        SELECT DISTINCT
               c.course_id,
               c.name,
               c.provider,
               c.duration,
               c.difficulty,
               c.skill_tag
        FROM   Courses c
        LEFT   JOIN Skills s
               ON  c.skill_tag   = s.skill_name
               AND s.student_id  = :sid
        WHERE  s.skill_id IS NULL
          AND  c.skill_tag NOT IN (
                   SELECT skill_name
                   FROM   Skills
                   WHERE  student_id = :sid2
               )
        ORDER  BY
            CASE c.difficulty
                WHEN 'Beginner'     THEN 1
                WHEN 'Intermediate' THEN 2
                WHEN 'Advanced'     THEN 3
            END ASC,
            c.name ASC
    ");
    $gap_stmt->execute([':sid' => $student_id, ':sid2' => $student_id]);
    $gap_courses = $gap_stmt->fetchAll();
    foreach ($gap_courses as &$c) {
        $c['course_id'] = (int)$c['course_id'];
    }
    unset($c);

    // ── Query 3: Courses to deepen UNVERIFIED skills — SQL IN ───────────────
    // Uses IN (subquery) to find courses whose skill_tag matches skills the
    // student has but hasn't yet had verified — good targets for focused study.
    $practice_stmt = $pdo->prepare("
        SELECT DISTINCT
               c.course_id,
               c.name,
               c.provider,
               c.duration,
               c.difficulty,
               c.skill_tag
        FROM   Courses c
        WHERE  c.skill_tag IN (
                   SELECT skill_name
                   FROM   Skills
                   WHERE  student_id = :sid
                     AND  verified   = 0
               )
        ORDER  BY c.difficulty ASC, c.name ASC
    ");
    $practice_stmt->execute([':sid' => $student_id]);
    $practice_courses = $practice_stmt->fetchAll();
    foreach ($practice_courses as &$c) {
        $c['course_id'] = (int)$c['course_id'];
    }
    unset($c);

    // ── Optional: missing skills for a specific internship ───────────────────
    // PHP-side diff: compares internship's required_skills CSV against the
    // student's current skill list.
    $missing_for_internship = [];
    $internship_title        = null;
    if ($internship_id) {
        $int_stmt = $pdo->prepare("
            SELECT company_name, role_title, required_skills
            FROM   Internships
            WHERE  internship_id = :iid
        ");
        $int_stmt->execute([':iid' => $internship_id]);
        $int_row = $int_stmt->fetch();
        if ($int_row) {
            $internship_title       = $int_row['company_name'] . ' — ' . $int_row['role_title'];
            $required               = array_map('trim', explode(',', $int_row['required_skills']));
            $missing_for_internship = array_values(array_diff($required, $have_names));
        }
    }

    http_response_code(200);
    echo json_encode([
        "success"                => true,
        "skills_you_have"        => $skills_you_have,
        "gap_courses"            => $gap_courses,
        "practice_courses"       => $practice_courses,
        "internship_title"       => $internship_title,
        "missing_for_internship" => $missing_for_internship,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
