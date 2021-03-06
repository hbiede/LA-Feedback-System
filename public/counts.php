<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

include_once 'sqlManager.php';

ini_set('error_log', './log/counts.log');

// Call with GET call with no query tags

// Returns the number of pieces of feedback
// Returns a JSON encoded array of objects formatted as follows:
//{
//  avg: double,
//  course: string
//}

function get_averages() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT course, COUNT(i.interaction_key) AS count FROM interactions i LEFT JOIN ' .
        'feedback f on f.interaction_key = i.interaction_key WHERE time_of_interaction >= (CURRENT_DATE() - ' .
        'INTERVAL 7 DAY) GROUP BY course;');
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

echo json_encode(get_averages());
