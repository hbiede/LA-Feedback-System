<?php
/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

ini_set('error_log', './log/ticket.log');

$casService = 'https://cse-apps.unl.edu/cas';
$thisService = 'https://cse.unl.edu/~learningassistants/LA-Feedback';

/*
* Returns the CAS response if the ticket is valid, and false if not.
*/
function responseForTicket($ticket) {
    global $casService, $thisService;
    $ticket = trim($ticket);
    $casGet = "$casService/serviceValidate?ticket=$ticket&service=$thisService";
    // See the PHP docs for warnings about using this method:
    // http://us3.php.net/manual/en/function.file-get-contents.php
    $response = file_get_contents($casGet);

    if (preg_match('/cas:authenticationSuccess/', $response)) {
        return $response;
    }
    else {
        error_log($response);
        return false;
    }
}

/*
* Check to see if there is a ticket in the POST request.
*/

$obj = json_decode(file_get_contents('php://input'));
if (isset($obj) && isset($obj->{'ticket'})) {
    if ($response = responseForTicket($obj->{'ticket'})) {
        $xml = simplexml_load_string($response);
        $user = $xml->children('http://www.yale.edu/tp/cas')->authenticationSuccess->user[0];

        echo $user;
    } else {
        echo 'INVALID_TICKET_KEY';
    }
} else {
    return 'EMPTY';
}
