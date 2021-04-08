<?php

if ($argc > 1) {
    $sql_info = json_decode(file_get_contents("data/sql.json"));

    if ($sql_info === null) {
        fwrite(STDERR, "Cannot decode sql login information\n");
    } else {
        $command = "mysql --user={$sql_info->{'username'}} --password='{$sql_info->{'password'}}' "
            . "-h {$sql_info->{'url'}} -D {$sql_info->{'database'}} < ./data/tableSetup.sql";

        if (system($command . "\n") === false) {
            fwrite(STDERR, "Failed to execute\n");
        }
    }
} else {
    fwrite(STDERR, "Invalid arguments\n");
}
