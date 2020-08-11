<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

include_once 'sqlManager.php';

ini_set('error_log', './log/times.log');

// Call with GET call with no query tags

// Returns a JSON encoded array of objects formatted as follows:
//{
//  time: string (DateTime in ISO-8601 format),
//  course: string
//}

function get_times() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT DATE_FORMAT(time_of_interaction, "%Y-%m-%dT%TZ") AS time, course FROM ' .
        'interactions ORDER BY time_of_interaction;');
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

echo json_encode(get_times());
