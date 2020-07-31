<?php
/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

include_once 'sqlManager.php';
ini_set('error_log', './log/interactionCount.log');

// Making a GET call against https://cse.unl.edu/~learningassistants/LA-Feedback/interactionCount.php
// will return a JSON array where each element is an object containing a string called “course” and
// a number called “count”.

echo json_encode(get_course_counts());
