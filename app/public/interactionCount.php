<?php
/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

include_once 'sqlManager.php';
ini_set('error_log', './log/interactionCount.log');

// Call with GET call with no query tags

// Returns a JSON encoded array of objects formatted as follows:
//{
//  count: int,
//  course: string
//}

echo json_encode(get_course_counts());
