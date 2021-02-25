<?php
// Give a user admin permissions:
// Call with a POST call with a JSON body as follows:
//{
//  username: string (username of the new Admin),
//}
ini_set('error_log', './log/addAdmin.log');
include_once 'sqlManager.php';

$obj = json_decode(file_get_contents('php://input'));
if (isset($obj) && isset($obj->{'username'})) {
    update_admin(true, get_username_id($obj->{'username'}));
}