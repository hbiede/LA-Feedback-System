<?php

include_once 'sqlManager.php';
ini_set('error_log', './log/feedback.log');

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
        $ps->bind_param("iss", $_POST['id'], $_POST['rating'], (isset($_POST['comment']) && $_POST['comment'] !== null && strlen(trim($_POST['comment'])) > 0) ? $_POST['comment'] : null);
        $ps->execute();
        $ps->close();
        $conn->commit();

        if ($_POST['rating'] < 5) {
            $la_username = '';
            $ps = $conn->prepare('SELECT username FROM cse_usernames WHERE username_key=(SELECT la_username_key FROM interactions WHERE interaction_key=?);');
            if (!$ps) {
                error_log('Failed to build prepped statement');
                $conn->close();
                return null;
            }
            $ps->bind_param("i", $_POST['id']);
            if ($ps->num_rows() > 0) {
                $ps->bind_result($la_username);
                $ps->fetch();
                $ps->close();
                $conn->close();
            }
            $ps->close();
            $conn->close();

            if ($la_username === '') {
                error_log('No Username found for interaction id: ' . $_POST['id']);
            } else {
                $headers = "MIME-Version: 1.0" . "\r\n";
                $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                $headers .= 'From: Learning Assistant Program <learningassistants@cse.unl.edu>' . "\r\n";

                $subject = 'Low Feedback';

                $body = shell_exec('cat ./data/lowFeedback.txt | sed "s/LA_USERNAME/' . $la_username . '/gi" | sed "s/STUDENT_RATING/' . $_POST['rating'] . '/gi" | sed "s/RATING_COMMENT/' . $_POST['comment'] . '/gi"');
                mail('hbiede@cse.unl.edu', $subject, $body, $headers);
            }
        }
    }
} else {
    error_log('Invalid POST contents: ' . var_export($_POST));
}
