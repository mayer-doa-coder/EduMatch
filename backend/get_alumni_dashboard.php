<?php
// ============================================================
// EduMatch — Alumni Dashboard Endpoint
// GET /backend/get_alumni_dashboard.php?alumni_id=1
// SQL operations: SELF JOIN, UNION ALL, IS NOT NULL,
//   Multiple JOINs
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

$alumni_id = isset($_GET['alumni_id']) ? (int)$_GET['alumni_id'] : 0;
if (!$alumni_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "alumni_id is required."]);
    exit();
}

try {
    $pdo = getDB();

    // ── Query 1: Alumni profile — Multiple JOINs ─────────────────────────────
    // Three tables joined: Alumni_Mentors → Users → Universities.
    // a.user_id is selected here so we reuse it for the message queries below,
    // avoiding a redundant second round-trip to the database.
    $q1 = $pdo->prepare("
        SELECT a.alumni_id,
               a.user_id,
               a.expertise,
               a.company,
               u.name,
               u.email,
               uni.uni_name AS university
        FROM   Alumni_Mentors a
        INNER  JOIN Users        u   ON a.user_id       = u.user_id
        LEFT   JOIN Universities uni ON u.university_id = uni.university_id
        WHERE  a.alumni_id = :aid
    ");
    $q1->execute([':aid' => $alumni_id]);
    $profile = $q1->fetch();

    if (!$profile) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Alumni member not found."]);
        exit();
    }
    $profile['alumni_id'] = (int)$profile['alumni_id'];
    $profile['user_id']   = (int)$profile['user_id'];

    // Reuse the user_id already fetched in Q1 — no extra query needed.
    $uid = $profile['user_id'];

    // ── Query 2: Alumni network — SELF JOIN ──────────────────────────────────
    // Alumni_Mentors is joined to itself with aliases a1 and a2.
    // ON a1.alumni_id <> a2.alumni_id produces every ordered pair of distinct
    // alumni, demonstrating the SELF JOIN pattern. With 4 alumni in the system
    // this yields 4 × 3 = 12 rows (each directional pair once).
    $q2 = $pdo->query("
        SELECT a1.alumni_id   AS mentor_id,
               u1.name        AS mentor_name,
               a1.company     AS mentor_company,
               a2.alumni_id   AS mentee_id,
               u2.name        AS mentee_name,
               a2.expertise   AS mentee_expertise
        FROM   Alumni_Mentors a1
        INNER  JOIN Alumni_Mentors a2 ON a1.alumni_id <> a2.alumni_id
        INNER  JOIN Users          u1 ON a1.user_id   = u1.user_id
        INNER  JOIN Users          u2 ON a2.user_id   = u2.user_id
        ORDER  BY a1.alumni_id ASC, a2.alumni_id ASC
    ");
    $network = $q2->fetchAll();
    foreach ($network as &$nw) {
        $nw['mentor_id'] = (int)$nw['mentor_id'];
        $nw['mentee_id'] = (int)$nw['mentee_id'];
    }
    unset($nw);

    // ── Query 3: Conversation feed — UNION ALL ───────────────────────────────
    // UNION ALL merges sent and received messages keeping every row, including
    // duplicates — contrast with UNION which would silently drop matching rows.
    // Named params :uid / :uid2 are intentionally distinct: with
    // ATTR_EMULATE_PREPARES = false, PDO native statements cannot reuse the
    // same named parameter twice in one query.
    $q3 = $pdo->prepare("
        SELECT sender_id    AS other_id,
               body,
               sent_at,
               'received'  AS direction
        FROM   Messages
        WHERE  receiver_id = :uid
        UNION  ALL
        SELECT receiver_id  AS other_id,
               body,
               sent_at,
               'sent'       AS direction
        FROM   Messages
        WHERE  sender_id   = :uid2
        ORDER  BY sent_at DESC
        LIMIT  20
    ");
    $q3->execute([':uid' => $uid, ':uid2' => $uid]);
    $messages = $q3->fetchAll();
    foreach ($messages as &$msg) {
        $msg['other_id'] = (int)$msg['other_id'];
    }
    unset($msg);

    // ── Query 4: Verified skills — IS NOT NULL + Multiple JOINs ─────────────
    // IS NOT NULL on verified_by means a faculty member formally confirmed
    // the skill. Multiple JOINs: Skills → Students → Users (student name) and
    // a second join back to Users (verifier name) via alias vf.
    $q4 = $pdo->query("
        SELECT sk.skill_id,
               sk.skill_name,
               sk.verified,
               s.student_id,
               u.name         AS student_name,
               vf.name        AS verified_by_name
        FROM   Skills    sk
        INNER  JOIN Students s  ON sk.student_id = s.student_id
        INNER  JOIN Users    u  ON s.user_id      = u.user_id
        INNER  JOIN Users    vf ON sk.verified_by = vf.user_id
        WHERE  sk.verified_by IS NOT NULL
        ORDER  BY u.name ASC, sk.skill_name ASC
        LIMIT  15
    ");
    $verified_students = $q4->fetchAll();
    foreach ($verified_students as &$vs) {
        $vs['skill_id']   = (int)$vs['skill_id'];
        $vs['student_id'] = (int)$vs['student_id'];
        $vs['verified']   = (bool)$vs['verified'];
    }
    unset($vs);

    http_response_code(200);
    echo json_encode([
        "success"           => true,
        "profile"           => $profile,
        "alumni_network"    => $network,
        "messages"          => $messages,
        "verified_students" => $verified_students,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
