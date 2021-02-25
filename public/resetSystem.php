<?php

ini_set('error_log', './log/resetSystem.log');

if ($argc > 1) {
    $sql_info = json_decode(file_get_contents("data/sql.json"));

    $command = "mysql --user={$sql_info->{'username'}} --password='{$sql_info->{'password'}}' "
        . "-h {$sql_info->{'url'}} -D {$sql_info->{'database'}} < ./data/tableSetup.sql";

    $output = shell_exec($command . "\n");
} else {
    fwrite(STDERR, "Invalid run\n");
}
