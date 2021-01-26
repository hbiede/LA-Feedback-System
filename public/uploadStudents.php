<?php
include_once 'sqlManager.php';
// Call and give the path to the file with student info as the only argument
// This file is expected to be formatted with every line conforming to the following spec:
// "course;name;canvasID;email"

function map($array_of_text) {
    $return_val = [];
    foreach ($array_of_text as $line) {
        array_push($return_val, str_replace("'", "\\'", $line));
    }
    return $return_val;
}

if ($argc === 0) {
    echo "Include a file name as an argument";
    return;
}

$file_contents = explode("\n", file_get_contents($argv[1]));

$values = "";

foreach ($file_contents as $line) {
    $line = trim($line);
    if (strlen($line) > 0) {
        if (strlen($values) > 0) $values .= ', ';
        $values .= "('" . join("','", map(explode(';', $line))) . "')";
    }
}

$conn = get_connection();
$conn->begin_transaction();
$ps = $conn->prepare("INSERT INTO cse_usernames (course, name, canvas_username, email) VALUES $values;");
if ($ps) {
    $ps->execute();
    if ($ps->error) error_log($ps->error);
    $conn->commit();
    $ps->close();
} else {
    error_log("Failed to build prepped statement to add values");
    error_log("INSERT INTO cse_usernames (course, name, canvas_username, email) VALUES $values;");
    error_log($conn->error);
}
$conn->close();
