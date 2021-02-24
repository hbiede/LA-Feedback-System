<?php

// Returns a JSON encoded object formatted as follows:
//{
//  students: Student[]
//}
//
// Where Student is defined as follows:
//{
//  canvas_username: string,
//  course: string,
//  id: int,
//  name: string
//}

include_once 'sqlManager.php';
ini_set('error_log', './log/student_list_accessor.log');


function get_students() {
    return run_accessor('SELECT username_key AS id, username, name, course, canvas_username FROM cse_usernames;');
}

$response = [
    'students' => get_students(),
];
echo json_encode($response);