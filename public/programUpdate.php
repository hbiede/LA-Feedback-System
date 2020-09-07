<?php

const DAYS = 7;

include_once 'sqlManager.php';

ini_set('error_log', './log/programUpdate.log');

function get_interaction_counts($days) {
    $conn = get_connection();
    $ps = $conn->prepare("SELECT course, COUNT(*) AS 'count' FROM interactions WHERE time_of_interaction >= " .
        "(CURRENT_DATE() - INTERVAL ? DAY) GROUP BY course;");
    $return_val = '<h4>Course Interactions:</h4><ul>';
    if ($ps) {
        $ps->bind_param('i', $days);
        $ps->execute();
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            $return_val .= "<li>" . $row['course'] . ' - ' . $row['count'] . "</li>";
        }
        $ps->close();
        $return_val .= '</ul>';
    }
    $conn->close();
    return $return_val;
}

function get_course_averages($days) {
    $conn = get_connection();
    $ps = $conn->prepare("SELECT course, AVG(rating) AS 'avg' FROM feedback LEFT JOIN interactions i on " .
        "feedback.interaction_key = i.interaction_key WHERE time_of_interaction >= (CURRENT_DATE() - INTERVAL ? DAY) " .
        "GROUP BY course ORDER BY course;");
    $return_val = '<h4>Course Feedback Averages:</h4><ul>';
    if ($ps) {
        $ps->bind_param('i', $days);
        $ps->execute();
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            $return_val .= "<li>" . $row['course'] . ' - ' . $row['avg'] . "</li>";
        }
        $ps->close();
        $return_val .= '</ul>';
    }
    $conn->close();
    return $return_val;
}

function get_update_string($days = DAYS) {
    $course_counts = get_interaction_counts($days);
    if (strlen($course_counts) === 0) {
        return '';
    }
    $course_averages = get_course_averages($days);

    $conn = get_connection();
    $ps = $conn->prepare('SELECT DATE_FORMAT(time_of_interaction, "%Y-%m-%dT%TZ") AS time, interaction_type, ' .
        'IFNULL(name, username) AS LA, rating, comment, cu.course AS "course" FROM feedback LEFT JOIN interactions i on ' .
        'feedback.interaction_key = i.interaction_key LEFT JOIN cse_usernames cu on ' .
        'i.la_username_key = cu.username_key WHERE time_of_interaction >= (CURRENT_DATE() - INTERVAL ? DAY);');
    $la_feedback = [];
    if ($ps) {
        $ps->bind_param('i', $days);
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        }
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            $buildingComment = $la_feedback[$row['LA']] ? $la_feedback[$row['LA']] : ($row['LA'] . " - " .
                $row['course'] . "<br><ul>");

            $comment = $row['comment'] ? " - " . str_replace(array("/", ";"), array("\/", "\;"), $row['comment']) : '';
            $la_feedback[$row['LA']] = $buildingComment . '<li>' . ucwords($row['interaction_type']) . ': ' .
                $row['rating'] . $comment . ' (' . $row['time'] . ')</li>';
        }
        $ps->close();
    } else {
        error_log('Failed create prepared statement');
    }
    $conn->close();

    $return_string = $course_counts . $course_averages . "<br><br><h4>Individual LA Feedback:</h4>";
    krsort($la_feedback);
    foreach ($la_feedback as $key => $value) {
        $return_string .= $value . "</ul><br>";
    }
    return $return_string;
}

function send_email($report) {
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: LA Evals Update <learningassistants@cse.unl.edu>' . "\r\n";

    $subject = 'LA Feedback Update';
    $body = shell_exec('cat ./data/programUpdate.txt') . $report;
    if (!$body || !mail('learningassistants@cse.unl.edu', $subject, $body, $headers) ||
        !mail('hbiede@cse.unl.edu', $subject, $body, $headers)) {
        error_log('Failed to send email');
    }
}

$update_string = get_update_string();
if (strlen($update_string) > 0) {
    send_email($update_string);
}
