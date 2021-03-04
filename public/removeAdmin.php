<?php
// Remove an admin's admin permissions:
// Call with a POST call with a JSON body as follows:
//{
//  id: number (the id of the admin to remove),
//}

ini_set('error_log', './log/removeAdmin.log');
include_once 'sqlManager.php';

$obj = json_decode(file_get_contents('php://input'));
if (isset($obj) && isset($obj->{'id'}) && $obj->{'id'} !== get_current_user()) {
    update_admin(false, $obj->{'id'});
}