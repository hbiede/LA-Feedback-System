<?php

include_once 'sqlManager.php';

ini_set('error_log', './log/times.log');

function get_times() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT time_of_interaction, course FROM interactions ORDER BY time_of_interaction;');
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
