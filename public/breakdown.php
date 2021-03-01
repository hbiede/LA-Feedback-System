<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

include_once 'sqlManager.php';

ini_set('error_log', './log/breakdown.log');

// Call with GET call with no query tags

// Returns a JSON encoded array of objects formatted as follows:
//{
//  username: string,
//  name?: string,
//  course: string,
//  count: number, (Number of interactions total)
//  wcount: number (Number of interactions in the last 7 days)
//}

function get_interaction_counts() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT canvas_username AS \'username\', name, c.course, COUNT(i.interaction_key) AS count, ' .
        'SUM(IF(i.time_of_interaction >= (CURRENT_DATE() - INTERVAL 7 DAY), 1, 0)) AS wcount FROM interactions i ' .
        'LEFT JOIN cse_usernames c on c.username_key = i.la_username_key GROUP BY username, canvas_username');
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

echo json_encode(get_interaction_counts());
