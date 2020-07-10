<?php

function get_connection() {
    $sql_info = json_decode(file_get_contents("sql.json"));
    $conn = new mysqli("cse.unl.edu", $sql_info->{'username'}, $sql_info->{'password'});
    mysqli_select_db($conn, $sql_info->{'database'});
    if ($conn->connect_error) {
        error_log('Connection failure: ' . $conn->connect_error);
        header('Status: 503');
        echo json_encode([
            'status' => 503,
            'message' => 3
        ]);
        return null;
    }
    return $conn;
}