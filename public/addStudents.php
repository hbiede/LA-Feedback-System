<?php
// To add students to the database
// Call with a POST call with a JSON body as follows:
//{
//  students: string (The new students with the text formatted as below),
//}

// This student list is expected to be formatted with every line conforming to the following spec:
// "course;name;canvasID;email"

ini_set('error_log', './log/addStudents.log');
include_once 'sqlManager.php';

$user = null;
$obj = json_decode(file_get_contents('php://input'));
if (isset($obj) && isset($obj->{'students'})) {
    if (add_students(parse_ssv_to_students_sql($obj->{'students'}))) {
        echo json_encode([
            'status' => 200,
            'message' => 0
        ]);
    } else {
        echo json_encode([
            'status' => 400,
            'message' => 1
        ]);
    }
} else {
    echo json_encode([
        'status' => 418, // Teapot outta here
        'message' => 2
    ]);
}
