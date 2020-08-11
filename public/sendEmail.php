<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

include_once 'sqlManager.php';
ini_set('error_log', './log/email.log');
date_default_timezone_set("America/Chicago");

// Call with a POST call with a JSON body as follows:
//{
//  studentCSE: string,
//  laCSE: string,
//  course: string
//}

// Returns a JSON encoded message as follows:
//{
//  status: number (HTML response code),
//  message?: string
//}

function send_email($obj, $interaction_id) {
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Learning Assistant Program <learningassistants@cse.unl.edu>' . "\r\n";
    $name = get_name_from_interaction($interaction_id);

    $subject = shell_exec('grep "<title>" form.php | sed "s/\s*<\/*title>//gi"');
    $body = shell_exec('cat ./data/emailBody.html | sed "s/INTERACTION_ID/' . $interaction_id .
        '/gi" | sed "s/LA_NAME/' . $name . '/gi"');
    if ($body && mail($obj->{'studentCSE'} . '@cse.unl.edu', $subject, $body, $headers)) {
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

/**
 * The percent of students that should receive a feedback email [0,1]
 */
const FEEDBACK_RATE = 0.5;

$obj = json_decode(file_get_contents('php://input'));
if (isset($obj) && isset($obj->{'laCSE'}) && isset($obj->{'studentCSE'}) && isset($obj->{'course'})
    && $obj->{'studentCSE'} !== $obj->{'laCSE'}) {
    $interaction_id = add_interaction($obj->{'laCSE'}, $obj->{'studentCSE'}, $obj->{'course'});

    if ($interaction_id !== null && $interaction_id > 0 && mt_rand() / mt_getrandmax() < FEEDBACK_RATE &&
        !received_email_today($obj->{'studentCSE'})) {
        send_email($obj, $interaction_id);
    } else {
        echo json_encode([
            'status' => 200,
            'message' => 0
        ]);
    }
} else {
    error_log('Cannot parse: ' . file_get_contents('php://input'));
    header('Status: 400');
    echo json_encode([
        'status' => 400,
        'message' => 2
    ]);
}

