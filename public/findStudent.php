<?php

// Call with a POST call with a JSON body as follows:
//{
//  canvas_username: string
//}

// Returns a JSON encoded message as follows:
//{
//  username_key: int
//}

include_once 'sqlManager.php';
ini_set('error_log', './log/find_student.log');

function get_students($username) {
    return run_accessor('SELECT `username_key` FROM `cse_usernames` WHERE `canvas_username` = "' . $username .'"');
}

$obj = json_decode(file_get_contents('php://input'));
  if (empty($obj->{'canvas_username'})) {
    header('Status: 400');
    echo json_encode([
        'status' => 400,
        'message' => 2
    ]);
  } else {
    echo json_encode(get_students($obj->{'canvas_username'}));
  }
