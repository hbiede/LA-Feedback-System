<?php

include_once 'sqlManager.php';
ini_set('error_log', './log/email.log');

/**
 * The percent of students that should receive a feedback email [0,1]
 */
const FEEDBACK_RATE = 1;

function add_cse($username) {
    $conn = get_connection();
    if ($conn !== null) {
        $conn->begin_transaction();
        $ps = $conn->prepare("INSERT INTO cse_usernames (username) VALUE (?);");
        if ($ps) {
            $ps->bind_param("s", $username);
            $ps->execute();
            $return_val = $ps->insert_id;
            $conn->commit();

            $ps->close();
            $conn->close();
            return $return_val;
        } else {
            error_log('Failed to build prepped statement');
        }
    }
    return null;
}

function get_username_id($username) {
    $conn = get_connection();
    if ($conn !== null) {
        $ps = $conn->prepare("SELECT username_key FROM cse_usernames WHERE username = ?;");
        if (!$ps) {
            error_log('Failed to build prepped statement');
            $conn->close();
            return null;
        }

        $ps->bind_param("s", $username);
        $ps->execute();
        if ($ps->num_rows() > 0) {
            $ps->bind_result($id);
            $ps->fetch();
            $ps->close();
            $conn->close();
            return $id;
        } else {
            return add_cse($username);
        }
    }
    return null;
}

function add_interaction($la_cse, $student_cse, $course) {
    $la_id = get_username_id($la_cse);
    $student_id = get_username_id($student_cse);
    $conn = get_connection();
    if ($conn !== null && is_int($la_id) && is_int($student_id)) {
        $conn->begin_transaction();
        $ps = $conn->prepare("INSERT INTO interactions (la_username_key, student_username_key, course) VALUE ((SELECT username_key FROM cse_usernames WHERE username=?),(SELECT username_key FROM cse_usernames WHERE username=?), ?);");
        if ($ps) {
            $ps->bind_param("sss", $la_cse, $student_cse, $course);
            $ps->execute();
            $conn->commit();
            $returnVal = $ps->insert_id;

            $ps->close();
            $conn->close();

            return $returnVal;
        } else {
            error_log('Failed to build prepped statement');
        }
    } else {
        error_log('Failed to add interaction for { la: ' . $la_cse . ', student: ' . $student_cse . ' }');
    }
    return null;
}

function update_interaction_for_feedback($interaction_id) {
    $conn = get_connection();
    if ($conn !== null && is_int($interaction_id) && $interaction_id > 0) {
        $conn->begin_transaction();
        $ps = $conn->prepare("UPDATE interactions SET seeking_feedback=true WHERE interaction_key=?;");
        if ($ps) {
            $ps->bind_param("s", $interaction_id);
            $ps->execute();
            $conn->commit();

            $ps->close();
            $conn->close();
        } else {
            error_log('Failed to build prepped statement');
        }
    } else {
        error_log('Failed to update interaction for { id: ' . $interaction_id . ' }');
    }
}

$obj = json_decode(file_get_contents('php://input'));


if (isset($obj) && isset($obj->{'laCSE'}) && isset($obj->{'studentCSE'}) && isset($obj->{'course'})) {
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Learning Assistant Program <learningassistants@cse.unl.edu>' . "\r\n";

    $subject = shell_exec('grep "<title>" form.html | sed "s/\s*<\/*title>//gi"');

    $interaction_id = add_interaction($obj->{'laCSE'}, $obj->{'studentCSE'}, $obj->{'course'});
    $body = shell_exec('cat ./data/emailBody.html | sed "s/INTERACTION_ID/' . $interaction_id . '/gi"');

    if ($interaction_id !== null && $interaction_id > 0 && mt_rand() / mt_getrandmax() < FEEDBACK_RATE) {
        if (mail($obj->{'studentCSE'} . '@cse.unl.edu', $subject, $body, $headers)) {
            update_interaction_for_feedback($interaction_id);

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
} else {
    header('Status: 400');
    echo json_encode([
        'status' => 400,
        'message' => 2
    ]);
}

