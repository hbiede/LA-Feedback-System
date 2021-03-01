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
//  admins: Admin[],
//  isAdmin: boolean,
//  logins: LoginRecord[],
//  outstanding: int (number of outstanding requests for feedback),
//  ratings: InteractionRecord[]
//  sentiment: int (sentiment of a all comments ([-100,100] inclusive)),
//  time: int (average time to complete the feedback form),
//}
// If the username in the POST call is not an admin, this script returns empty data

// Where Admin is an object with admins as follows:
//{
//  id: number,
//  username: string,
//}

// Where LoginRecord is an object summarizing a LA login timestamp as follows:
//{
//  la: string (LA's name),
//  time_of_interaction: date,
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
//  avg: double|null (avg rating from feedback),
//  sentiment: int|null (sentiment of a given comment ([0,100] inclusive))
//}

include_once 'sqlManager.php';

ini_set('error_log', './log/admin.log');

function get_logins() {
    return run_accessor("SELECT UNIX_TIMESTAMP(time_of_interaction) AS 'time_of_interaction', " .
        "CONCAT(IFNULL(cul.name, cul.username), IF(is_admin, ' (Admin)', '')) AS 'la' " .
        "FROM logins l " .
        "LEFT JOIN cse_usernames cul on l.la_username_key = cul.username_key " .
        "ORDER BY time_of_interaction");
}

function get_sentiment() {
    $result = -1;
    $conn = get_connection();
    $ps = $conn->prepare('SELECT AVG(sentiment) AS "sentiment" FROM feedback;');
    if ($ps) {
        $ps->execute();
        $result = $ps->get_result()->fetch_assoc()['sentiment'];
        $ps->close();
    }
    $conn->close();
    return $result == null ? -1 : $result;
}

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
    return $result == null ? -1 : $result;
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
    $ps = $conn->prepare('SELECT IFNULL(canvas_username, username) AS \'username\', CONCAT(name, IF(is_admin, \' (Admin)\', \'\')) AS \'name\', ' .
        'cse_usernames.course, COUNT(i.interaction_key) AS count, COUNT(t.interaction_key) AS wCount, ' .
        'COUNT(f.feedback_key) AS fCount, ' .
        'AVG(rating) AS avg, AVG(sentiment) AS sentiment FROM cse_usernames ' .
        'LEFT JOIN interactions i on cse_usernames.username_key = i.la_username_key ' .
        'LEFT JOIN feedback f on i.interaction_key = f.interaction_key ' .
        'LEFT JOIN (SELECT interaction_key FROM interactions WHERE interactions.time_of_interaction >= CURDATE() - INTERVAL 7 DAY) t on t.interaction_key = i.interaction_key ' .
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
    $ps = $conn->prepare('SELECT rating, comment, course, sentiment, ' .
        ' UNIX_TIMESTAMP(time_of_interaction) AS time FROM feedback ' .
        'LEFT JOIN interactions i on feedback.interaction_key = i.interaction_key WHERE ' .
        'feedback.interaction_key IN (SELECT interaction_key FROM interactions WHERE la_username_key = ' .
        '(SELECT username_key FROM cse_usernames WHERE username = ?)) ORDER BY rating DESC;');
    $returnVal = [];
    if ($ps) {
        $ps->bind_param('s', $la_username);
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        } else {
            $result = $ps->get_result();
            while ($row = $result->fetch_assoc()) {
                array_push($returnVal, $row);
            }
            $ps->close();
        }
    } else {
        error_log("Failed to build PS to get ratings for $la_username");
    }
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

$isAdmin = is_admin($user);
if ($isAdmin && $la !== null) {
    echo json_encode(get_ratings($la));
} else if ($isAdmin) {
    $response = [
        'isAdmin' => true,
        'admins' => get_admins(),
        'logins' => get_logins(),
        'ratings' => get_interactions(),
        'time' => get_time_to_complete(),
        'outstanding' => get_outstanding_feedback(),
        'sentiment' => get_sentiment(),
    ];
    echo json_encode($response);
} else {
    $response = [
        'isAdmin' => false,
        'admins' => [],
        'logins' => [],
        'ratings' => [],
        'time' => -1,
        'outstanding' => 0,
        'sentiment' => -1,
    ];
    echo json_encode($response);
}
