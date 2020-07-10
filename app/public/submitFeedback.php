<?php

include_once 'sqlManager.php';
ini_set('error_log', './log/feedback.log');

if (isset($_POST) && isset($_POST['id']) && isset($_POST['rating'])) {
    $conn = get_connection();
    if ($conn !== null) {
        $conn->begin_transaction();
        $ps = $conn->prepare("UPDATE interactions SET has_received_feedback=true WHERE interaction_key=?;");
        if (!$ps) {
            error_log('Failed to build prepped statement');
            $conn->close();
            return null;
        }
        $ps->bind_param("i", $_POST['id']);
        $ps->execute();
        $ps->close();

        $ps = $conn->prepare("INSERT INTO feedback (interaction_key, rating, comment) VALUE (?, ?, ?);");
        if (!$ps) {
            error_log('Failed to build prepped statement');
            $conn->close();
            return null;
        }
        $ps->bind_param("iss", $_POST['id'], $_POST['rating'], (isset($_POST['comment']) && $_POST['comment'] !== null && strlen(trim($_POST['comment'])) > 0) ? $_POST['comment'] : null);
        $ps->execute();
        $ps->close();
        $conn->commit();
        $conn->close();
    }
} else {
    error_log('Invalid POST contents: ' . var_export($_POST));
}