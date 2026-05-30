<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/lib/db.php';

$input = json_decode(file_get_contents("php://input"), true);

// Base required fields for every role
if (
    $_SERVER['REQUEST_METHOD'] !== 'POST' ||
    empty($input['name'])     ||
    empty($input['email'])    ||
    empty($input['password']) ||
    empty($input['role'])
) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Name, email, password, and role are required."]);
    exit();
}

$name       = trim($input['name']);
$email      = trim($input['email']);
$password   = $input['password'];
$role       = strtolower(trim($input['role']));
$university = trim($input['university'] ?? '');
$department = trim($input['department'] ?? '');

// Map frontend role label → DB enum value
$db_role = ($role === 'supervisor') ? 'faculty' : $role;

// Admins cannot self-register
if ($db_role === 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Admin accounts cannot be self-registered."]);
    exit();
}

// Validate DB enum
$allowed = ['student', 'faculty', 'company', 'alumni'];
if (!in_array($db_role, $allowed, true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid role specified."]);
    exit();
}

// Student and supervisor require university + department
if (in_array($db_role, ['student', 'faculty'], true) && (empty($university) || empty($department))) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "University and department are required for this role."]);
    exit();
}

try {
    $pdo = getDB();

    // 1. Check email uniqueness
    $checkStmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = :email LIMIT 1");
    $checkStmt->execute([':email' => $email]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "This email address is already registered."]);
        exit();
    }

    // 2. Resolve university_id (optional for company role)
    $university_id = null;
    if ($university !== '') {
        $univStmt = $pdo->prepare("SELECT university_id FROM Universities WHERE uni_name = :uName LIMIT 1");
        $univStmt->execute([':uName' => $university]);
        $univRow      = $univStmt->fetch();
        $university_id = $univRow ? (int)$univRow['university_id'] : null;
    }

    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // 3. Transaction: insert Users row + role-specific child row
    $pdo->beginTransaction();

    $userStmt = $pdo->prepare(
        "INSERT INTO Users (name, email, password_hash, role, university_id)
         VALUES (:name, :email, :pass, :role, :univ_id)"
    );
    $userStmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':pass'    => $password_hash,
        ':role'    => $db_role,
        ':univ_id' => $university_id,
    ]);
    $new_user_id = (int)$pdo->lastInsertId();
    $profile_id  = null;

    if ($db_role === 'student') {
        $stmt = $pdo->prepare(
            "INSERT INTO Students (user_id, cgpa, research_interest, technical_skills, assigned_supervisor_id)
             VALUES (:uid, NULL, NULL, NULL, NULL)"
        );
        $stmt->execute([':uid' => $new_user_id]);
        $profile_id = (int)$pdo->lastInsertId();

    } elseif ($db_role === 'faculty') {
        $stmt = $pdo->prepare(
            "INSERT INTO Faculty (user_id, designation, quota, current_student_count, research_focus)
             VALUES (:uid, :desig, 5, 0, NULL)"
        );
        $stmt->execute([':uid' => $new_user_id, ':desig' => $department . " Department"]);
        $profile_id = (int)$pdo->lastInsertId();

    } elseif ($db_role === 'alumni') {
        // Alumni_Mentors entry created with empty expertise/company — user fills profile later
        $stmt = $pdo->prepare(
            "INSERT INTO Alumni_Mentors (user_id, expertise, company) VALUES (:uid, NULL, NULL)"
        );
        $stmt->execute([':uid' => $new_user_id]);
        $profile_id = (int)$pdo->lastInsertId();

    }
    // company: no child table — profile_id stays null

    $pdo->commit();

    // Translate faculty back to supervisor for the frontend
    $response_role = ($db_role === 'faculty') ? 'supervisor' : $db_role;

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful! Welcome to EduMatch.",
        // Return the same user shape as login.php so the frontend can store the session immediately
        "user" => [
            "user_id"    => $new_user_id,
            "profile_id" => $profile_id,
            "name"       => $name,
            "email"      => $email,
            "role"       => $response_role,
        ],
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Registration failed. Please try again.",
        "error"   => $e->getMessage(),
    ]);
}
?>
