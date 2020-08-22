<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

// To get list of interaction counts per LA:
// Call with a POST call with a JSON body as follows:
//{
//  username: string (username of the Admin running the check),
//}

// Returns a JSON encoded object formatted as follows:
//{
//  time: int (average time to complete the feedback form),
//  ratings: InteractionRecord[]
//}
// If the username in the POST call is not an admin, this script returns an empty array

// Where InteractionRecord is an object summarizing a single LA formatted as follows:
//{
//  username: string,
//  name?: string (if the LA has a name set),
//  course?: string (if the LA has a default course set),
//  count: int (number of interactions),
//  fCount: int (number of pieces of feedback submitted),
//  avg: double|null (avg rating from feedback)
//}

// ---------------------

// To get list of ratings for a single LA:
// Call with a POST call with a JSON body as follows:
//{
//  username: string (username of the Admin running the check),
//  la: string (the LA whose ratings you are seeking)
//}

// Returns a JSON encoded object formatted as follows:
//{
//  time: int (average time to complete the feedback form),
//  ratings: InteractionRecord[],
//  outstanding: int (number of unanswered feedback requests)
//}

// Where InteractionRecord is an object summarizing a single LA formatted as follows:
//{
//  username: string,
//  name?: string (if the LA has a name set),
//  course?: string (if the LA has a default course set),
//  count: int (number of interactions),
//  fCount: int (number of pieces of feedback submitted),
//  avg: double|null (avg rating from feedback)
//}

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

function get_outstanding_feedback() {
    $result = -1;
    $conn = get_connection();
    $ps = $conn->prepare('SELECT COUNT(*) AS "req" from interactions ' .
        'WHERE seeking_feedback=1 AND has_received_feedback=0;');
    if ($ps) {
        $ps->execute();
        $result = $ps->get_result()->fetch_assoc()['req'];
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
    $ps = $conn->prepare('SELECT rating, comment, course, DATE_FORMAT(time_of_interaction, "%Y-%m-%dT%TZ") ' .
        'AS time FROM feedback LEFT JOIN interactions i on feedback.interaction_key = i.interaction_key WHERE ' .
        'feedback.interaction_key IN (SELECT interaction_key FROM interactions WHERE la_username_key = ' .
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
        'time' => get_time_to_complete(),
        'outstanding' => get_outstanding_feedback(),
    ];
    echo json_encode($response);
} else {
    echo '[]';
}
