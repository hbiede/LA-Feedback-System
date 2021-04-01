<?php

include_once 'sqlManager.php';
ini_set('error_log', './log/interactionDownload.log');

function send_interactions_csv() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT time_of_interaction, ' .
        "IFNULL(cul.name, cul.username) AS 'la', " .
        "IFNULL(cus.name, cus.username) AS 'student', " .
        "i.course, " .
        "interaction_type, " .
        "seeking_feedback, " .
        "has_received_feedback, " .
        "IF(was_recommended, 'Recommended', 'Not Recommended') AS 'recommendation_status' " .
        "FROM interactions i " .
        "LEFT JOIN cse_usernames cul on i.la_username_key = cul.username_key " .
        "LEFT JOIN cse_usernames cus on i.student_username_key = cus.username_key " .
        "ORDER BY time_of_interaction");
    if ($ps) {
        $ps->execute();
        $result = $ps->get_result();
        if ($result) {
            $csv_writer = fopen('php://output', 'w');
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="interactions.csv"');
            header('Pragma: no-cache');
            header('Expires: 0');
            $first = true;
            while ($row = $result->fetch_assoc()) {
                if ($first) {
                    $first = false;
                    fputcsv($csv_writer, array_keys($row));
                }
                fputcsv($csv_writer, array_values($row));
            }

        } else {
            error_log('Results failed to pull');
        }
        $ps->close();
    } else {
        error_log('PS failed to build');
        error_log($conn->error);
    }
    $conn->close();
}

send_interactions_csv();
