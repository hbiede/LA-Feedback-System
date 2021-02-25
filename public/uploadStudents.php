<?php
include_once 'sqlManager.php';
// Call and give the path to the file with student info as the only argument
// This file is expected to be formatted with every line conforming to the following spec:
// "course;name;canvasID;email"
//
// The only entries that will be inserted are entries where the set of course, username, and canvas_username
// do not exist in the database (no duplicates for the same class, but students taking multiple courses in
// the program is permitted).



if ($argc === 0) {
    echo "Include a file name as an argument";
    return;
}

add_students(
    parse_ssv_to_students_sql(
        file_get_contents($argv[1])
    )
);

