<?php

include_once 'sqlManager.php';
ini_set('error_log', './log/feedback.log');

/**
 * LAs will receive a summary of their last X pieces of feedback
 */
const FEEDBACK_RATE = 5;

function get_feedback_count($la_username) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT COUNT(*) AS count FROM feedback WHERE interaction_key IN ' .
        '(SELECT interaction_key FROM interactions WHERE la_username_key = ' .
        '(SELECT username_key FROM cse_usernames WHERE username = ?));');
    if ($ps) {
        $ps->bind_param('s', $la_username);
        $ps->execute();
        $count = $ps->get_result()->fetch_assoc()['count'];
        $ps->close();
        $conn->close();
        return $count;
    } else {
        error_log('Failed to build prepped statement');
        $conn->close();
        return -1;
    }
}

function get_latest($la_username) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT rating, comment FROM feedback LEFT JOIN ' .
        'interactions ON feedback.interaction_key = interactions.interaction_key WHERE la_username_key = ' .
        '(SELECT username_key FROM cse_usernames WHERE username=?) ORDER BY time_of_interaction DESC LIMIT ?;');
    $feedback_count = FEEDBACK_RATE;
    $ps->bind_param('si', $la_username, $feedback_count);
    $ps->execute();
    $results = $ps->get_result();
    $returnVal = [];
    while($row = $results->fetch_assoc()) {
        array_push($returnVal, $row);
    }
    return $returnVal;
}

function send_feedback_to_la($la_username) {
    $feedback_count = get_feedback_count($la_username);
    if ($feedback_count > 0 && $feedback_count % FEEDBACK_RATE === 0) {
        $feedback = get_latest($la_username);

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: Learning Assistant Program <learningassistants@cse.unl.edu>' . "\r\n";

        $subject = 'LA Feedback Summary';
        $ratings = '';
        foreach ($feedback as $index=>$item) {
            $feedback_string = $item['rating'];
            if ($item['comment'] !== null) {
                $feedback_string .= ' - ' . $item['comment'];
            }

            $ratings .= "<li class=\"list-group-item list-group-item-dark\">$feedback_string</li>\n";
        }
        $body = str_replace('RATINGS_LISTING', $ratings, shell_exec('cat ./data/feedbackSummary.html'));
        $body = str_replace('LATEST_FEEDBACK_COUNT', FEEDBACK_RATE, $body);
        mail("$la_username@cse.unl.edu", $subject, $body, $headers);
        error_log('sending');
    }
}

if (isset($_POST) && isset($_POST['id']) && isset($_POST['rating'])) {
    $conn = get_connection();
    if ($conn !== null) {
        $conn->begin_transaction();
        $ps = $conn->prepare("UPDATE interactions SET has_received_feedback=true WHERE interaction_key=?;");
        if (!$ps) {
            error_log('Failed to build prepped statement');
            $conn->close();
            return null;
        }
        $ps->bind_param("i", $_POST['id']);
        $ps->execute();
        $ps->close();

        $ps = $conn->prepare("INSERT INTO feedback (interaction_key, rating, comment) VALUE (?, ?, ?);");
        if (!$ps) {
            error_log('Failed to build prepped statement');
            $conn->close();
            return null;
        }
        $comment = (isset($_POST['comment']) && $_POST['comment'] !== null && strlen(trim($_POST['comment'])) > 0) ? $_POST['comment'] : null;
        $ps->bind_param("iss", $_POST['id'], $_POST['rating'], $comment);
        $ps->execute();
        $ps->close();
        $conn->commit();
        $la_username = get_username_id($_POST['id']);
        send_feedback_to_la($la_username);

        if ($_POST['rating'] < 5) {
            $conn->close();

            if ($la_username === '') {
                error_log('No Username found for interaction id: ' . $_POST['id']);
            } else {
                $headers = "MIME-Version: 1.0" . "\r\n";
                $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                $headers .= 'From: Learning Assistant Program <learningassistants@cse.unl.edu>' . "\r\n";

                $subject = 'Low Feedback';

                $body = shell_exec('cat ./data/lowFeedback.txt | sed "s/LA_USERNAME/' . $la_username . '/gi" | sed "s/STUDENT_RATING/' . $_POST['rating'] . '/gi" | sed "s/RATING_COMMENT/' . $_POST['comment'] . '/gi"');
                mail('learningassistants@cse.unl.edu', $subject, $body, $headers);
            }
        }
    }
} else {
    error_log('Invalid POST contents: ' . var_export($_POST));
}
