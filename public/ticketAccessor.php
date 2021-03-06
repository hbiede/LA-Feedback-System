<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

require_once 'sqlManager.php';

ini_set('error_log', './log/ticket.log');

// Call with a POST call with a JSON body as follows:
//{
//  ticket: string
//}

// Returns a string of the username

$casService = 'https://shib.unl.edu/idp/profile/cas';
$thisService = get_url();

function add_login($username, $name, $email) {
    error_log("Attempting to log $username");
    $la_id = get_username_id($username, $name, $email);
    $conn = get_connection();
    if ($conn !== null) {
        $conn->begin_transaction();
        $ps = $conn->prepare("INSERT INTO logins (la_username_key) VALUE (?);");
        if ($ps) {
            $ps->bind_param("i", $la_id);
            $ps->execute();
            if ($ps->error) {
                error_log("Failed to log $username");
            }
            $conn->commit();
            $ps->close();
        } else {
            error_log("Failed to build prepped statement for login for $username");
        }
        $conn->close();
    } else {
        error_log('Failed to connect to log login');
    }
}

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
    else if (strlen(trim($response)) > 0){
        error_log($response);
        return false;
    } else {
        error_log("Empty response");
        return false;
    }
}

/*
* Check to see if there is a ticket in the POST request.
*/

$obj = json_decode(file_get_contents('php://input'));
if (isset($obj) && isset($obj->{'ticket'})) {
    if (isset($obj->{'service'}) && $obj->{'service'} !== $thisService) {
        $thisService = $obj->{'service'};
    }

    if ($response = responseForTicket($obj->{'ticket'})) {
        $xml = simplexml_load_string($response);
        $user = $xml->children('http://www.yale.edu/tp/cas')->authenticationSuccess->user[0];
        $name = $xml->children('http://www.yale.edu/tp/cas')->authenticationSuccess->attributes->displayName;
        $email = $xml->children('http://www.yale.edu/tp/cas')->authenticationSuccess->attributes->email[0];
        add_login($user, $name, $email);
        echo $user;
    } else {
        echo 'INVALID_TICKET_KEY';
    }
} else {
    return 'EMPTY';
}
