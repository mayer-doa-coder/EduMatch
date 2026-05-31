<?php
// ============================================================
// EduMatch — Supervisor Dashboard Endpoint
// GET /backend/get_supervisor_dashboard.php?faculty_id=1
// SQL operations: GROUP BY, HAVING, COUNT, AVG, MIN, MAX,
//   RIGHT JOIN, SELECT from VIEW (v_blind_applicants),
//   Subquery in FROM (derived table)
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

$faculty_id = isset($_GET['faculty_id']) ? (int)$_GET['faculty_id'] : 0;
if (!$faculty_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "faculty_id is required."]);
    exit();
}

try {
    $pdo = getDB();

    // ── Query 1: Supervisor profile + student stats ──────────────────────────
    // GROUP BY, COUNT, AVG
    // LEFT JOIN so supervisors with zero assigned students still return a row.
    $q1 = $pdo->prepare("
        SELECT f.faculty_id,              f.designation,
               f.quota,                   f.current_student_count,
               f.research_focus,          u.name,            u.email,
               COUNT(s.student_id)        AS actual_count,
               ROUND(AVG(s.cgpa), 2)      AS avg_student_cgpa
        FROM   Faculty f
        INNER  JOIN Users    u ON f.user_id               = u.user_id
        LEFT   JOIN Students s ON s.assigned_supervisor_id = f.faculty_id
        WHERE  f.faculty_id = :fid
        GROUP  BY f.faculty_id, f.designation, f.quota,
                  f.current_student_count, f.research_focus,
                  u.name, u.email
    ");
    $q1->execute([':fid' => $faculty_id]);
    $profile = $q1->fetch();

    if (!$profile) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Faculty member not found."]);
        exit();
    }
    $profile['faculty_id']            = (int)$profile['faculty_id'];
    $profile['quota']                 = (int)$profile['quota'];
    $profile['current_student_count'] = (int)$profile['current_student_count'];
    $profile['actual_count']          = (int)$profile['actual_count'];
    $profile['avg_student_cgpa']      = $profile['avg_student_cgpa'] !== null
                                        ? (float)$profile['avg_student_cgpa'] : null;

    // ── Query 2: Thesis breakdown by status ─────────────────────────────────
    // GROUP BY + HAVING + AVG + MIN + MAX
    // HAVING COUNT(*) > 0 filters out statuses with no projects (redundant here
    // but explicitly demonstrates HAVING vs WHERE).
    $q2 = $pdo->prepare("
        SELECT p.status,
               COUNT(*)                      AS total,
               ROUND(AVG(p.health_score), 1) AS avg_health,
               MIN(p.health_score)           AS min_health,
               MAX(p.health_score)           AS max_health
        FROM   Projects_Thesis p
        WHERE  p.supervisor_id = :fid
        GROUP  BY p.status
        HAVING COUNT(*) > 0
        ORDER  BY p.status
    ");
    $q2->execute([':fid' => $faculty_id]);
    $thesis_summary = $q2->fetchAll();
    foreach ($thesis_summary as &$ts) {
        $ts['total']      = (int)$ts['total'];
        $ts['avg_health'] = (float)$ts['avg_health'];
        $ts['min_health'] = (int)$ts['min_health'];
        $ts['max_health'] = (int)$ts['max_health'];
    }
    unset($ts);

    // ── Query 3: System-wide overloaded supervisors ──────────────────────────
    // GROUP BY + HAVING (current_student_count >= quota)
    $q3 = $pdo->query("
        SELECT f.faculty_id,
               u.name                  AS supervisor_name,
               f.current_student_count,
               f.quota
        FROM   Faculty f
        INNER  JOIN Users u ON f.user_id = u.user_id
        GROUP  BY f.faculty_id, u.name, f.current_student_count, f.quota
        HAVING f.current_student_count >= f.quota
        ORDER  BY f.current_student_count DESC
    ");
    $overloaded = $q3->fetchAll();
    foreach ($overloaded as &$ol) {
        $ol['faculty_id']            = (int)$ol['faculty_id'];
        $ol['current_student_count'] = (int)$ol['current_student_count'];
        $ol['quota']                 = (int)$ol['quota'];
    }
    unset($ol);

    // ── Query 4: Faculty load summary — RIGHT JOIN ───────────────────────────
    // RIGHT JOIN: starts from Faculty (right table), so every supervisor row
    // is preserved even if no student has assigned_supervisor_id = faculty_id.
    // A plain LEFT JOIN from Students would silently drop supervisors with
    // zero direct assignments.
    $q4 = $pdo->query("
        SELECT f.faculty_id,
               u.name                       AS supervisor_name,
               f.quota,
               f.current_student_count,
               COUNT(s.student_id)          AS actual_assigned
        FROM       Students  s
        RIGHT JOIN Faculty   f ON s.assigned_supervisor_id = f.faculty_id
        INNER JOIN Users     u ON f.user_id                = u.user_id
        GROUP  BY f.faculty_id, u.name, f.quota, f.current_student_count
        ORDER  BY actual_assigned DESC
    ");
    $faculty_load = $q4->fetchAll();
    foreach ($faculty_load as &$fl) {
        $fl['faculty_id']            = (int)$fl['faculty_id'];
        $fl['quota']                 = (int)$fl['quota'];
        $fl['current_student_count'] = (int)$fl['current_student_count'];
        $fl['actual_assigned']       = (int)$fl['actual_assigned'];
    }
    unset($fl);

    // ── One-time safe migration: SupervisorReviews table ───────────────────
    // Wrapped in its own try-catch so a DDL failure never breaks the whole
    // dashboard response. The subsequent query uses a LEFT JOIN instead of
    // NOT IN so it degrades gracefully even if the table is missing.
    $reviews_table_ok = false;
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS SupervisorReviews (
                review_id   INT AUTO_INCREMENT PRIMARY KEY,
                faculty_id  INT NOT NULL,
                student_id  INT NOT NULL,
                decision    ENUM('accepted','rejected','waitlisted') NOT NULL,
                reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_fac_stu (faculty_id, student_id),
                FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id)
                    ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES Students(student_id)
                    ON UPDATE CASCADE ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        $reviews_table_ok = true;
    } catch (PDOException $e2) {
        // Table may already exist with a slightly different definition,
        // or we lack DDL privileges — treat as non-fatal.
        $reviews_table_ok = false;
    }

    // ── Query 5: Blind applicants — filtered by university AND unreviewed ──
    // Uses COALESCE so NULL technical_skills / research_interest never
    // reach the frontend as null — they arrive as empty strings instead.
    // LEFT JOIN on SupervisorReviews (only applied when the table exists)
    // excludes applicants this supervisor has already decided on.
    if ($reviews_table_ok) {
        $q5 = $pdo->prepare("
            SELECT v.code,
                   v.student_id,
                   COALESCE(v.cgpa, 0.00)                      AS cgpa,
                   COALESCE(v.research_interest, '')            AS research_interest,
                   COALESCE(v.technical_skills,  '')            AS technical_skills
            FROM   v_blind_applicants v
            LEFT   JOIN SupervisorReviews sr
                   ON  sr.student_id = v.student_id
                   AND sr.faculty_id = :fid2
            WHERE  v.university_id = (
                       SELECT uu.university_id FROM Users uu
                       WHERE  uu.user_id = (
                                  SELECT f2.user_id FROM Faculty f2
                                  WHERE  f2.faculty_id = :fid
                              )
                   )
              AND  sr.review_id IS NULL
            ORDER  BY v.cgpa DESC
            LIMIT  20
        ");
        $q5->execute([':fid' => $faculty_id, ':fid2' => $faculty_id]);
    } else {
        // Fallback: no review filtering — original behaviour
        $q5 = $pdo->prepare("
            SELECT v.code,
                   v.student_id,
                   COALESCE(v.cgpa, 0.00)                      AS cgpa,
                   COALESCE(v.research_interest, '')            AS research_interest,
                   COALESCE(v.technical_skills,  '')            AS technical_skills
            FROM   v_blind_applicants v
            WHERE  v.university_id = (
                       SELECT uu.university_id FROM Users uu
                       WHERE  uu.user_id = (
                                  SELECT f2.user_id FROM Faculty f2
                                  WHERE  f2.faculty_id = :fid
                              )
                   )
            ORDER  BY v.cgpa DESC
            LIMIT  20
        ");
        $q5->execute([':fid' => $faculty_id]);
    }
    $blind_applicants = $q5->fetchAll();
    foreach ($blind_applicants as &$ba) {
        $ba['student_id']       = (int)$ba['student_id'];
        $ba['cgpa']             = (float)$ba['cgpa'];
        // These are already COALESCE-d to '' above, but belt-and-suspenders:
        $ba['research_interest'] = (string)($ba['research_interest'] ?? '');
        $ba['technical_skills']  = (string)($ba['technical_skills']  ?? '');
    }
    unset($ba);

    // ── Query 6: My students — Subquery in FROM (derived table) ─────────────
    // The inner SELECT defines the derived table alias "ranked".
    // ORDER BY lives on the OUTER SELECT — correct in MySQL 8; putting ORDER BY
    // inside a derived table without LIMIT is a no-op in MySQL 8+.
    $q6 = $pdo->prepare("
        SELECT ranked.*
        FROM (
            SELECT s.student_id,
                   u.name,
                   s.cgpa,
                   s.research_interest,
                   p.project_id,
                   p.title         AS thesis_title,
                   p.status        AS thesis_status,
                   p.health_score
            FROM   Students         s
            INNER  JOIN Users           u ON s.user_id    = u.user_id
            LEFT   JOIN Projects_Thesis p ON p.student_id = s.student_id
            WHERE  s.assigned_supervisor_id = :fid
        ) AS ranked
        ORDER  BY ranked.cgpa DESC, ranked.health_score DESC
    ");
    $q6->execute([':fid' => $faculty_id]);
    $my_students = $q6->fetchAll();
    foreach ($my_students as &$ms) {
        $ms['student_id']   = (int)$ms['student_id'];
        $ms['cgpa']         = (float)$ms['cgpa'];
        $ms['project_id']   = $ms['project_id']   !== null ? (int)$ms['project_id']   : null;
        $ms['health_score'] = $ms['health_score'] !== null ? (int)$ms['health_score'] : null;
    }
    unset($ms);

    http_response_code(200);
    echo json_encode([
        "success"                => true,
        "profile"                => $profile,
        "thesis_summary"         => $thesis_summary,
        "overloaded_supervisors" => $overloaded,
        "faculty_load"           => $faculty_load,
        "blind_applicants"       => $blind_applicants,
        "my_students"            => $my_students,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
