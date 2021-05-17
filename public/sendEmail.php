<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

include_once 'sqlManager.php';
ini_set('error_log', './log/email.log');
date_default_timezone_set("America/Chicago");

/**
 * The percent of students that should receive a feedback email [0,1]
 */
const FEEDBACK_RATE = 0.6;
const EMAIL = 'cselearningassistant+noreply@gmail.com';

// Call with a POST call with a JSON body as follows:
//{
//  studentID: string,
//  laCSE: string,
//  course: string,
//  interactionType: string | null,
//  recommended?: boolean,
//}

// Returns a JSON encoded message as follows:
//{
//  status: number (HTML response code),
//  message?: string | int
//}

/*
 * Response codes:
 * 0 - Success
 * 1 - Email send failure
 * 2 - Unknown (Deprecated)
 * 3 - 30 seconds between interactions (Deprecated)
 * 4 - Failed to get an interaction ID
 */

function send_email($obj, $interaction_id) {
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: Learning Assistant Program <" . EMAIL . ">\r\n";
    $name = get_name_from_interaction($interaction_id);

    $subject = shell_exec('grep "<title>" form.php | sed "s/\s*<\/*title>//gi"');
    $body = shell_exec('cat ./data/emailBody.html | sed "s/INTERACTION_ID/' . $interaction_id .
        '/gi" | sed "s/LA_NAME/' . $name . '/gi"');
    $address = get_email($obj->{'studentID'});
    if ($body && $address && mail($address, $subject, $body, $headers)) {
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

$obj = json_decode(file_get_contents('php://input'));
if (isset($obj) && isset($obj->{'laCSE'}) && isset($obj->{'studentID'}) && isset($obj->{'course'})) {
    $interaction_id = add_interaction($obj->{'laCSE'}, $obj->{'studentID'}, $obj->{'course'}, $obj->{'interactionType'}, isset($obj->{'recommended'}) && ($obj->{'recommended'} === true || $obj->{'recommended'} === 'true'));

    if ($interaction_id !== null && $interaction_id > 0 &&
        (has_been_a_week($obj->{'laCSE'}) || mt_rand() / mt_getrandmax() < FEEDBACK_RATE) &&
        !received_email_today($obj->{'studentID'})) {
        send_email($obj, $interaction_id);
    } else {
        if ($interaction_id === null) {
            echo json_encode([
                'status' => 500,
                'message' => 4
            ]);
        } else {
            echo json_encode([
                'status' => 200,
                'message' => 0
            ]);
        }
    }
} else {
    error_log('Cannot parse: ' . file_get_contents('php://input'));
    header('Status: 400');
    echo json_encode([
        'status' => 400,
        'message' => 2
    ]);
}

