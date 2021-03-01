<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

include_once 'sqlManager.php';
ini_set('error_log', './log/name.log');

// To get the name associated with a username:
// Call with a POST call with a JSON body as follows:
//{
//  username: string
//}

// Returns the current name


// To update the name associated with a username:
// Call with a POST call with a JSON body as follows:
//{
//  username: string,
//  updateVal: string
//}

// Returns the new name (potential for error checking)

function get_name($username) {
    $conn = get_connection();
    $response = '';
    $ps = $conn->prepare('SELECT name FROM cse_usernames WHERE canvas_username=?;');
    if ($ps) {
        $ps->bind_param('s', $username);
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        } else {
            $response = $ps->get_result()->fetch_assoc()['name'];
        }
        $ps->close();
    } else {
        error_log('Failed to build prepped statement');
    }
    $conn->close();
    return $response;
}

function set_name($username, $name) {
    get_username_id($username);
    $conn = get_connection();
    $ps = $conn->prepare('UPDATE cse_usernames SET name=? WHERE canvas_username=?;');
    if ($ps) {
        $ps->bind_param('ss', $name, $username);
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
if (isset($obj) && $obj->{'updateVal'}) {
    if (isset($obj->{'username'}) && $obj->{'username'}) {
        set_name($obj->{'username'}, $obj->{'updateVal'});
        $response->{'name'} = $obj->{'updateVal'};
    }
} else {
    if (isset($obj) && isset($obj->{'username'})) {
        $response->{'name'} = get_name($obj->{'username'});
    } else {
        $response->{'name'} = '';
    }
}
echo json_encode($response);
