<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

include_once 'sqlManager.php';
ini_set('error_log', './log/feedback.log');

// Call with a POST call with a JSON body as follows:
//{
//  id: number,
//  rating: int,
//  comment?: string,
//  contact: boolean,
//  time: int
//}

// Returns a JSON encoded message as follows:
//{
//  status: number (HTML response code),
//  message?: string
//}

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

function rating_sort($a, $b) {
    if ($a['rating'] < $b['rating']) {
        return -1;
    } else if ($a['rating'] === $b['rating']) {
        return 0;
    } else {
        return 1;
    }
}

function send_feedback_to_la($la_username) {
    $feedback_count = get_feedback_count($la_username);
    if ($feedback_count > 0 && $feedback_count % FEEDBACK_RATE === 0) {
        $feedback = get_latest($la_username);
        usort($feedback, "rating_sort");

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
    }
}

if (isset($_POST) && isset($_POST['id']) && !is_nan($_POST['id']) && isset($_POST['rating']) && !is_nan($_POST['rating'])) {
    $conn = get_connection();
    if ($conn !== null) {
        $conn->begin_transaction();
        $ps = $conn->prepare("UPDATE interactions SET has_received_feedback=true WHERE interaction_key=?;");
        if (!$ps) {
            error_log('Failed to build prepped statement');
            $conn->close();
            header('Status: 503 OK');
            echo json_encode([
                'status' => 503,
                'message' => 3
            ]);
            return null;
        }
        $ps->bind_param("i", $_POST['id']);
        $ps->execute();
        $ps->close();

        $ps = $conn->prepare("INSERT INTO feedback (interaction_key, rating, comment, desires_feedback, "
            . "time_to_complete) VALUE (?, ?, ?, ?, ?);");
        if (!$ps) {
            error_log('Failed to build prepped statement');
            $conn->close();
            header('Status: 503 OK');
            echo json_encode([
                'status' => 503,
                'message' => 2
            ]);
            return null;
        }
        $desires_feedback = $_POST['contact'] === true || $_POST['contact'] === 'true';
        $feedback_int = $desires_feedback ? 1 : 0;
        $feedback_time = (isset($_POST['time']) && !is_nan($_POST['time'])) ? $_POST['time'] : -1;
        $comment = (isset($_POST['comment']) && $_POST['comment'] !== null && strlen(trim($_POST['comment'])) > 0)
            ? $_POST['comment']
            : null;
        $ps->bind_param("issii",
            $_POST['id'],
            $_POST['rating'],
            $comment,
            $feedback_int,
            $feedback_time);
        $ps->execute();
        $ps->close();
        $conn->commit();
        $la_username = get_la_username_from_interaction($_POST['id']);
        send_feedback_to_la($la_username);

        if ($_POST['rating'] < 5 || $desires_feedback) {
            $conn->close();

            if ($la_username === '') {
                error_log('No Username found for interaction id: ' . $_POST['id']);
            } else {
                $headers = "MIME-Version: 1.0" . "\r\n";
                $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                $headers .= 'From: Learning Assistant Program <learningassistants@cse.unl.edu>' . "\r\n";

                $subject = 'Low Feedback';

                $la_name = get_name_from_interaction($_POST['id']);

                $body = shell_exec('cat ./data/lowFeedback.txt | sed "s/LA_USERNAME/' . $la_name
                    . '/gi" | sed "s/STUDENT_RATING/' . $_POST['rating'] . '/gi" | sed "s/RATING_COMMENT/'
                    . $_POST['comment'] . '/gi"');

                if ($desires_feedback) {
                    $student_username = get_student_username_from_interaction($_POST['id']);
                    $body .= "<br><br>---<br><br>The student requested feedback. Their email is $student_username@cse.unl.edu";
                }

                $email = $la_username === 'hbiede' ? 'hbiede@cse.unl.edu' : 'learningassistants@cse.unl.edu';

                mail($email, $subject, $body, $headers);
            }
        }
        header('Status: 200 OK');
    } else {
        header('Status: 503 OK');
        echo json_encode([
            'status' => 503,
            'message' => 1
        ]);
    }
} else {
    error_log('Invalid POST contents: ' . var_export($_POST));
    header('Status: 503 OK');
    echo json_encode([
        'status' => 503,
        'message' => 2
    ]);
}
