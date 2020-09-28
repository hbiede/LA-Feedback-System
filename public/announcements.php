<?php

include_once 'sqlManager.php';
ini_set('error_log', './log/announcements.log');

// To get the name associated with a username:
// Call with a GET call
//{
//  course: string
//}

// Returns the current announcements for that course as follows:
//{
//  body: string,
//  class?: string
//}


// To update the announcement associated with a course:
// Call with a POST call with a JSON body as follows:
//{
//  course: string,
//  body: string,
//  class?: string
//}

// To clear all announcements:
// Call with a POST call with a JSON body as follows:
//{
//  clear: boolean
//}

function clear_announcements() {
    $conn = get_connection();
    $ps = $conn->prepare("TRUNCATE announcements;");
    if ($ps) {
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        }
        $ps->close();
    }
    $conn->close();
}

function set_announcements($course, $body, $class = 'info') {
    $conn = get_connection();


    if ($course === 'all') {
        clear_announcements();
    } else {
        $ps = $conn->prepare("DELETE FROM announcements WHERE course = ?;");
        if ($ps) {
            $ps->bind_param('s', $course);
            $ps->execute();
            if ($ps->error) {
                error_log($ps->error);
            }
            $ps->close();
        }
    }


    $ps = $conn->prepare("INSERT INTO announcements (course, body, class) VALUE (?, ?, ?);");
    if ($ps) {
        $ps->bind_param('sss', $course, $body, $class);
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        }
        $ps->close();
    } else {
        error_log("Failed to prepare announcement setting statement");
    }
    $conn->close();
}

function get_announcements($course = 'all') {
    $conn = get_connection();
    $ps = $conn->prepare("SELECT * FROM (SELECT body,class FROM announcements WHERE course=? UNION " .
        "SELECT body,class FROM announcements WHERE course='all') as combo LIMIT 1;");
    if ($ps) {
        $search_course = $course === null ? 'all' : $course;
        $ps->bind_param('s', $search_course);
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        }
        $row = $ps->get_result()->fetch_assoc();
        $response = [
            'body' => $row['body'],
            'class' => $row['class']
        ];
        $ps->close();
    } else {
        error_log('Failed to build prepared statement to get announcements');
        $response = [
            'body' => ''
        ];
    }
    $conn->close();
    return $response;
}

$obj = json_decode(file_get_contents('php://input'));
$response = new stdClass();
if (isset($obj) && isset($obj->{'clear'})) {
    clear_announcements();
} else if (isset($obj) && isset($obj->{'body'})) {
    set_announcements($obj->{'course'}, $obj->{'body'}, $obj->{'class'});
} else {
    $response = get_announcements($obj->{'course'});
}
echo json_encode($response);