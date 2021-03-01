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
    return run_accessor('SELECT c.username_key AS id, c.username, c.name, c.course, c.canvas_username, ' .
        'COUNT(i.interaction_key) AS \'interaction_count\' FROM cse_usernames c LEFT JOIN interactions i ' .
        'ON c.username_key = i.student_username_key GROUP BY username_key;');
}

$response = [
    'students' => get_students(),
];
echo json_encode($response);
