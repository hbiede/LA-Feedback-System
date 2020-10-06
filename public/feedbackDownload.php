<?php

include_once 'sqlManager.php';
ini_set('error_log', './log/feedbackDownload.log');

function send_csv() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT IFNULL(name, username) AS "LA",rating, comment, ' .
        'IFNULL(CONCAT(sentiment, "%"), "") AS sentiment, interaction_type, time_of_interaction FROM feedback ' .
        'LEFT JOIN interactions i on feedback.interaction_key = i.interaction_key LEFT JOIN cse_usernames cu on ' .
        'i.la_username_key = cu.username_key ORDER BY username, time_of_interaction;');
    if ($ps) {
        $ps->execute();
        $result = $ps->get_result();
        if ($result) {
            $csv_writer = fopen('php://output', 'w');
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="feedback.csv"');
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
    }
    $conn->close();
}

send_csv();
