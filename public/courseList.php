<?php

/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

// To get list of courses in the program:
// Call with a GET call. Result will be an array of strings

echo file_get_contents("./data/courses.json");
