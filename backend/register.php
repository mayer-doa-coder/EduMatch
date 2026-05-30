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

$input_data = json_decode(file_get_contents("php://input"), true);

if (
    $_SERVER['REQUEST_METHOD'] !== 'POST' || 
    empty($input_data['name']) || 
    empty($input_data['email']) || 
    empty($input_data['password']) || 
    empty($input_data['role']) ||
    empty($input_data['university']) ||
    empty($input_data['department'])
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Required dynamic registration input parameters are missing."
    ]);
    exit();
}

$name = trim($input_data['name']);
$email = trim($input_data['email']);
$password = $input_data['password']; 
$role = strtolower(trim($input_data['role']));
$university = trim($input_data['university']);
$department = trim($input_data['department']);

if ($role === 'supervisor') {
    $role = 'faculty';
}

try {
    $pdo = getDB();

    // 1. Cross-check availability in central Users relation
    $checkUser = $pdo->prepare("SELECT user_id FROM Users WHERE email = :email LIMIT 1");
    $checkUser->execute([':email' => $email]);

    if ($checkUser->fetch()) {
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "message" => "This university email address is already registered."
        ]);
        exit();
    }

    // 2. Resolve relational foreign key mappings (maps to your column 'uni_name')
    $univStmt = $pdo->prepare("SELECT university_id FROM Universities WHERE uni_name = :uName LIMIT 1");
    $univStmt->execute([':uName' => $university]);
    $univRow = $univStmt->fetch();
    
    $university_id = $univRow ? (int)$univRow['university_id'] : null; 

    // Generate secure cryptographically hashed string values
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // 3. Begin Transaction
    $pdo->beginTransaction();

    // Insert to core parent table
    $userSql = "INSERT INTO Users (name, email, password_hash, role, university_id) 
                VALUES (:name, :email, :pass, :role, :univ_id)";
    $userStmt = $pdo->prepare($userSql);
    $userStmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':pass'    => $password_hash,
        ':role'    => $role,
        ':univ_id' => $university_id
    ]);

    $newUserId = $pdo->lastInsertId();

    // Map profiles into child extension tables
    if ($role === 'student') {
        $studentSql = "INSERT INTO Students (user_id, cgpa, research_interest, technical_skills, assigned_supervisor_id) 
                       VALUES (:user_id, NULL, NULL, NULL, NULL)";
        $studentStmt = $pdo->prepare($studentSql);
        $studentStmt->execute([':user_id' => $newUserId]);
        
    } else if ($role === 'faculty') {
        $facultySql = "INSERT INTO Faculty (user_id, designation, quota, current_student_count, research_focus) 
                       VALUES (:user_id, :dept_fallback, 5, 0, NULL)";
        $facultyStmt = $pdo->prepare($facultySql);
        $facultyStmt->execute([
            ':user_id'       => $newUserId,
            ':dept_fallback' => $department . " Department"
        ]);
    } else {
        $pdo->rollBack();
        throw new Exception("Encountered unsupported registration system context path role.");
    }

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful! Welcome to the ecosystem."
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Ecosystem dynamic registration instance encountered a system crash.",
        "error" => $e->getMessage()
    ]);
}
?>