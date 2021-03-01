<?php

/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

// To get list of courses in the program:
// Call with a GET call. Result will be an array of strings

ini_set('error_log', './log/courseList.log');
include_once 'sqlManager.php';

function get_courses() {
    $course_assoc = run_accessor('SELECT DISTINCT course FROM cse_usernames WHERE course IS NOT NULL ORDER BY course');
    $returnVal = [];
    foreach ($course_assoc as $course) {
        array_push($returnVal, $course['course']);
    }
    return $returnVal;
}
echo json_encode(get_courses());
