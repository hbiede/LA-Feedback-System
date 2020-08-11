<?php

const DAYS = 7;

include_once 'sqlManager.php';

ini_set('error_log', './log/programUpdate.log');

function get_update_string($days = DAYS) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT DATE_FORMAT(time_of_interaction, "%Y-%m-%dT%TZ") AS time,  ' .
        'IFNULL(name, username) AS LA, rating, comment FROM feedback LEFT JOIN interactions i on ' .
        'feedback.interaction_key = i.interaction_key LEFT JOIN cse_usernames cu on ' .
        "i.la_username_key = cu.username_key WHERE time_of_interaction >= (CURRENT_DATE() - INTERVAL ? DAY);");
    $returnVal = "";
    if ($ps) {
        $ps->bind_param('i', $days);
        $ps->execute();
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            $comment = $row['comment'] ? " - " . str_replace(array("/", ";"), array("\/", "\;"), $row['comment']) : '';
            $rowString = $row['LA'] . " (" . $row['time'] . ")<br><ul><li>" .
                $row['rating'] . $comment . '<\/li><\/ul><br>';

            $returnVal .= $rowString;
        }
        $ps->close();
    }
    $conn->close();
    return trim($returnVal);
}

function send_email($report) {
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: LA Evals Update <learningassistants@cse.unl.edu>' . "\r\n";

    $subject = 'LA Feedback Update';
    $body = shell_exec('cat ./data/programUpdate.txt | sed "s/REPORT_STRING/' . $report . '/g"');
    if ($body && mail('learningassistants@cse.unl.edu', $subject, $body, $headers)) {
        header('Status: 200 OK');
        echo json_encode([
            'status' => 200,
            'message' => 0
        ]);
    } else {
        error_log('Failed to send email');
        header('Status: 503');
        echo json_encode([
            'status' => 503,
            'message' => 1
        ]);
    }
}

$update_string = get_update_string();
if (strlen($update_string) > 0) {
    send_email($update_string);
}