<?php
/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

include_once 'sqlManager.php';

ini_set('error_log', './log/admin.log');

function get_time_to_complete() {
    $result = -1;
    $conn = get_connection();
    $ps = $conn->prepare('SELECT AVG(time_to_complete) AS "avg" FROM feedback;');
    if ($ps) {
        $ps->execute();
        $result = $ps->get_result()->fetch_assoc()['avg'];
        $ps->close();
    }
    $conn->close();
    return $result;
}

function get_interactions() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT username, name, cse_usernames.course, COUNT(i.interaction_key) AS count, ' .
        'COUNT(f.feedback_key) AS fCount, AVG(rating) AS avg FROM cse_usernames LEFT JOIN interactions i on ' .
        'cse_usernames.username_key = i.la_username_key LEFT JOIN feedback f on i.interaction_key = f.interaction_key ' .
        'GROUP BY username ORDER BY username;');
    $returnVal = [];
    if ($ps) {
        $ps->execute();
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            array_push($returnVal, $row);
        }
        $ps->close();
    }
    $conn->close();
    return $returnVal;
}

function get_ratings($la_username) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT rating, comment, course, time_of_interaction AS time FROM feedback LEFT JOIN ' .
        'interactions i on feedback.interaction_key = i.interaction_key WHERE feedback.interaction_key IN ' .
        '(SELECT interaction_key FROM interactions WHERE la_username_key = ' .
        '(SELECT username_key FROM cse_usernames WHERE username = ?)) ORDER BY rating DESC;');
    $ps->bind_param('s', $la_username);
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

$user = null;
$obj = json_decode(file_get_contents('php://input'));
if (isset($obj) && isset($obj->{'user'})) {
    $user = $obj->{'user'};
}

$la = null;
if (isset($obj) && isset($obj->{'la'})) {
    $la = $obj->{'la'};
}

$admins = json_decode(file_get_contents("./data/admins.json"));
$isAdmin = $user !== null && in_array($user, $admins);
if ($isAdmin && $la !== null) {
    echo json_encode(get_ratings($la));
} else if ($isAdmin) {
    $response = [
        'ratings' => get_interactions(),
        "time" => get_time_to_complete()
    ];
    echo json_encode($response);
} else {
    echo '[]';
}
