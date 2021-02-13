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


function get_students() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT username_key AS id, username, name, course, canvas_username FROM cse_usernames;');
    $ps->execute();
    $result = $ps->get_result();
    $returnVal = [];
    while ($row = $result->fetch_assoc()) {
        array_push($returnVal, $row);
    }
    $ps->close();
    $conn->close();
    return $returnVal;
}

$response = [
    'students' => get_students(),
];
echo json_encode($response);