<?php
include_once 'sqlManager.php';

session_start();

ini_set('error_log', './log/admin.log');

function get_interactions() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT username, name, COUNT(i.interaction_key) AS count, AVG(rating) AS avg ' .
        'FROM cse_usernames LEFT JOIN interactions i on cse_usernames.username_key = i.la_username_key LEFT JOIN ' .
        'feedback f on i.interaction_key = f.interaction_key GROUP BY username ORDER BY username;');
    $ps->execute();
    $result = $ps->get_result();
    $returnVal = [];
    while ($row = $result->fetch_assoc()) {
        array_push($returnVal, $row);
    }
    return $returnVal;
}

function get_ratings($la_username) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT rating, comment FROM feedback WHERE interaction_key IN ' .
        '(SELECT interaction_key FROM interactions WHERE la_username_key = ' .
        '(SELECT username_key FROM cse_usernames WHERE username = ?)) ORDER BY rating DESC;');
    $ps->bind_param('s', $la_username);
    $ps->execute();
    $result = $ps->get_result();
    $returnVal = [];
    while ($row = $result->fetch_assoc()) {
        array_push($returnVal, $row);
    }
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
    echo json_encode(get_interactions());
} else {
    echo '[]';
}
