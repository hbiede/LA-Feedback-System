<?php

$json = file_get_contents('php://input');
if (strlen($json) > 0) {
    $obj = json_decode($json, TRUE);
} else {
    $obj = [];
    $obj['email'] = $argv[0];
    $obj['laCSE'] = $argv[1];
}

if (isset($obj['email']) && isset($obj['laCSE'])) {
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Learning Assistant Program <hbiede@cse.unl.edu>' . "\r\n";

    $subject = system('grep "<title>" emailBody.html | sed "s/\s*<\/*title>//gi"');
    $body = file_get_contents("emailBody.html");

    if (mail($obj['email'], $subject, $body, $headers)) {
        header('Status: 200 OK');
        echo json_encode(array(
            'status' => 200,
            'message' => 0
        ));
    } else {
        header('Status: 503');
        echo json_encode(array(
            'status' => 500,
            'message' => 1
        ));
    }
} else {
    header('Status: 400');
    echo json_encode(array(
        'status' => 400,
        'message' => 2
    ));
}

