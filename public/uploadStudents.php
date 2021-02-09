<?php
include_once 'sqlManager.php';
// Call and give the path to the file with student info as the only argument
// This file is expected to be formatted with every line conforming to the following spec:
// "course;name;canvasID;email"
//
// The only entries that will be inserted are entries where the set of course, username, and canvas_username
// do not exist in the database (no duplicates for the same class, but students taking multiple courses in
// the program is permitted).

function map($array_of_text) {
    $return_val = [];
    foreach ($array_of_text as $line) {
        array_push($return_val, str_replace("'", "\\'", $line));
    }
    return $return_val;
}

function run_ps($ps, $conn, $action) {
    $return_val = true;
    if ($ps) {
        $ps->execute();
        if ($ps->error) {
            error_log($ps->error);
            $return_val = false;
        }
        $ps->close();
    } else {
        error_log("Failed to build prepped statement to $action.");
        error_log($conn->error);
        $return_val = false;
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
$ps_create_table = $conn->prepare(
    "CREATE TABLE IF NOT EXISTS TEMP_USERNAMES_FOR_MERGE" .
    "(" .
    "username_key    int auto_increment unique primary key," .
    "username        varchar(20)," .
    "canvas_username varchar(20)," .
    "name            varchar(70)," .
    "course          varchar(10)," .
    "email           varchar(100)" .
    ");");
$working = run_ps($ps_create_table, $conn, "create temp table");

if ($working) {
    $ps_insert = $conn->prepare(
        "INSERT INTO TEMP_USERNAMES_FOR_MERGE (course, name, canvas_username, email) VALUES $values;"
    );
    $working = run_ps($ps_insert, $conn, "insert to temp table");
}

if ($working) {
    $ps_merge = $conn->prepare(
        "INSERT INTO cse_usernames (username, canvas_username, name, course, email) " .
        "SELECT t.username, t.canvas_username, t.name, t.course, email FROM TEMP_USERNAMES_FOR_MERGE t " .
        "WHERE (SELECT COUNT(*) FROM cse_usernames c WHERE " .
        "(c.username IS NULL OR c.username LIKE t.username) " .
        "AND (c.canvas_username IS NULL OR c.canvas_username LIKE t.canvas_username) " .
        "AND c.course LIKE t.course) < 1 ORDER BY canvas_username;"
    );
    $working = run_ps($ps_merge, $conn, "merge temp table into main username table");
}

if ($working) {
    $ps_drop = $conn->prepare("DROP TABLE TEMP_USERNAMES_FOR_MERGE;");
    $working = run_ps($ps_drop, $conn, "drop table");
}

if ($working) {
    $conn->commit();
}
$conn->close();
