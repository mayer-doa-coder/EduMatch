<?php
// api/get_stats.php

// 1. Headers to allow Cross-Origin Resource Sharing (CORS) 
// for your React frontend
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 2. Database Connection (Replace with your credentials)
$host = "localhost";
$db_name = "edumatch_db";
$username = "root";
$password = "";

try {
    // In a real app, you would query the DB. 
    // Here we provide dynamic data simulation.
    
    // Example: $count = $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();

    $responseData = [
        "status" => "success",
        "students" => 12842, // Dynamically fetched
        "supervisors" => 845,
        "accuracy" => 97,
        "thesisHealth" => 88,
        "lastUpdated" => date("Y-m-d H:i:s")
    ];

    // 3. Output the JSON
    http_response_code(200);
    echo json_encode($responseData);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Internal Server Error"
    ]);
}
?>