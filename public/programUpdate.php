<?php

const DAYS = 7;

include_once 'sqlManager.php';

ini_set('error_log', './log/programUpdate.log');

function should_update($days = DAYS) {
    $conn = get_connection();
    $ps = $conn->prepare("SELECT COUNT(*) AS 'count' FROM interactions WHERE time_of_interaction >= " .
        "(CURRENT_DATE() - INTERVAL ? DAY);");
    $count = 0;
    if ($ps) {
        $ps->bind_param('i', $days);
        $ps->execute();
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            $count += $row['count'];
        }
        $ps->close();
    } else {
        error_log('Failed to build should_update ps');
    }
    $conn->close();
    return $count > 0;
}

function get_interaction_counts($days) {
    $conn = get_connection();
    $ps = $conn->prepare("SELECT course, COUNT(*) AS 'count' FROM interactions WHERE time_of_interaction >= " .
        "(CURRENT_DATE() - INTERVAL ? DAY) GROUP BY course;");
    $return_val = '';
    $header = '<h4>Course Interactions:</h4><ul>';
    if ($ps) {
        $ps->bind_param('i', $days);
        $ps->execute();
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            $return_val .= "<li>" . $row['course'] . ' - ' . $row['count'] . "</li>";
        }
        $ps->close();
        if (strlen($return_val) > 0) {
            $return_val .= '</ul>';
        }
    }
    $conn->close();
    return strlen($return_val) > 0 ? ($header . $return_val) : '';
}

function get_course_averages($days) {
    $conn = get_connection();
    $ps = $conn->prepare("SELECT course, AVG(rating) AS 'avg', AVG(sentiment) AS 'sentiment' FROM feedback " .
        "LEFT JOIN interactions i on feedback.interaction_key = i.interaction_key WHERE " .
        "time_of_interaction >= (CURRENT_DATE() - INTERVAL ? DAY) GROUP BY course ORDER BY course;");
    $return_val = '';
    $header = '<h4>Course Feedback Averages:</h4><ul>';
    if ($ps) {
        $ps->bind_param('i', $days);
        $ps->execute();
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            $return_val .= "<li>" . $row['course'] . ' - ' . round($row['avg'], 2) .
                ' (Avg Comment Sentiment: ' . round($row['sentiment'], 2) . "%)</li>";
        }
        $ps->close();
        if (strlen($return_val) > 0) {
            $return_val .= '</ul>';
        }
    }
    $conn->close();
    return strlen($return_val) > 0 ? ($header . $return_val) : '';
}

function get_feedback($days = DAYS) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT DATE_FORMAT(time_of_interaction, \'%Y-%m-%dT%TZ\') AS time, ' .
        'interaction_type, sentiment, IFNULL(name, IFNULL(canvas_username, username)) AS LA, rating, ' .
        'comment, cu.course AS "course" FROM feedback LEFT JOIN interactions i ' .
        'on feedback.interaction_key = i.interaction_key ' .
        'LEFT JOIN cse_usernames cu on i.la_username_key = cu.username_key ' .
        'WHERE time_of_interaction >= (CURRENT_DATE() - INTERVAL ? DAY);');
    $la_feedback = [];
    if ($ps) {
        $ps->bind_param('i', $days);
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
        }
        $result = $ps->get_result();
        while ($row = $result->fetch_assoc()) {
            $buildingComment = isset($la_feedback[$row['LA']])
                ? $la_feedback[$row['LA']]
                : ($row['LA'] . " - " . $row['course'] . "<br><ul>");

            $comment = $row['comment']
                ? " - " . str_replace(array("/", ";"), array("\/", "\;"), $row['comment'])
                    . ' (Sentiment: ' . $row['sentiment'] . '%)'
                : '';
            $la_feedback[$row['LA']] = $buildingComment . '<li>' . ucwords($row['interaction_type']) . ': ' .
                $row['rating'] . $comment . ' (' . $row['time'] . ')</li>';
        }
        $ps->close();
    } else {
        error_log('Failed create prepared statement');
        error_log($conn->error);
    }
    $conn->close();
    if (count($la_feedback) === 0) return '';

    $return_string = "<br><br><h4>Individual LA Feedback:</h4><br>";
    krsort($la_feedback);
    foreach ($la_feedback as $key => $value) {
        $return_string .= $value . "</ul><br>";
    }
    return $return_string;
}

function get_update_string($days = DAYS) {
    return get_interaction_counts($days) . get_course_averages($days) . get_feedback($days);
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

if (should_update()) {
    $update_string = get_update_string();
    if (strlen($update_string) > 0) {
        send_email($update_string);
    }
}
