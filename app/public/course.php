<?php
/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

include_once 'sqlManager.php';
ini_set('error_log', './log/course.log');

function get_course($username) {
    $conn = get_connection();
    $response = '';
    $ps = $conn->prepare('SELECT course FROM cse_usernames WHERE username=?;');
    if ($ps) {
        $ps->bind_param('s', $username);
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        } else {
            $response = $ps->get_result()->fetch_assoc()['course'];
        }
        $ps->close();
    } else {
        error_log('Failed to build prepped statement');
    }
    $conn->close();
    return $response;
}

function set_course($username, $course) {
    get_username_id($username);
    $conn = get_connection();
    $ps = $conn->prepare('UPDATE cse_usernames SET course=? WHERE username=?;');
    if ($ps) {
        $ps->bind_param('ss', $course, $username);
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        }
        $ps->close();
    } else {
        error_log('Failed to build prepped statement');
    }
    $conn->close();
}

$obj = json_decode(file_get_contents('php://input'));
$response = new stdClass();
if (isset($obj) && isset($obj->{'updateVal'}) && $obj->{'updateVal'}) {
    if (isset($obj->{'username'}) && $obj->{'username'}) {
        set_course($obj->{'username'}, $obj->{'updateVal'});
        $response->{'course'} = $obj->{'updateVal'};
    }
} else {
    if (isset($obj) && isset($obj->{'username'}) && $obj->{'username'}) {
        $response->{'course'} = get_course($obj->{'username'});
    } else {
        $response->{'course'} = '';
    }
}
echo json_encode($response);
