<?php

// Call with a POST call with a JSON body as follows:
//{
//  canvas_username: string;
//  name?: string; (optional name of the student)
//  email?: string; (optional email of the student)
//}

// Returns a JSON encoded message as follows:
//{
//  username_key: int
//}

include_once 'sqlManager.php';
ini_set('error_log', './log/find_student.log');

$obj = json_decode(file_get_contents('php://input'));
if (isset($obj->{'canvas_username'})) {
    echo json_encode([
        'status' => 400,
        'message' => 2,
        'username_key' => get_username_id($obj->{'canvas_username'}, $obj->{'name'}, $obj->{'email'}, false),
    ]);
} else {
    header('Status: 400');
    echo json_encode([
        'status' => 400,
        'message' => 2,
        'username_key' => -1,
    ]);
}
