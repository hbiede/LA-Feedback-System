<?php

ini_set('error_log', './log/tickets.log');
session_start();
$casService = 'https://cse-apps.unl.edu/cas';
$thisService = $_GET["service"];

function login() {
    global $casService, $thisService;
    unset($_SESSION['cas_user']);
    unset($_SESSION['timeout']);
    session_destroy();
    header("Location: $casService/login?service=$thisService");
}

function parse_ticket($ticket) {
    global $casService, $thisService;
    $ticket = trim($ticket);
    $service = urlencode($thisService);
    $response = file_get_contents("$casService/serviceValidate?ticket=$ticket&service=$service");

    if (preg_match('/cas:authenticationSuccess/', $response)) {
        return $response;
    } else if (preg_match('/INVALID_TICKET/', $response)) {
        return "INVALID_TICKET";
    } else {
        return false;
    }
}

function get_username() {
    if ($_SERVER["REQUEST_METHOD"] == "GET" && $_GET["ticket"]) {
        if ($response = parse_ticket($_GET["ticket"])) {
            if ($response === "INVALID_TICKET") {
                login();
            } else {
                $xml = simplexml_load_string($response);
                $user = $xml->children('http://www.yale.edu/tp/cas')->authenticationSuccess->user[0];

                $_SESSION['cas_user'] = $user;
                $_SESSION['timeout'] = time() + 45000;
                return $user;
            }
        } else {
            return null;
        }
    } else {
        if (isset($_SESSION['cas_user']) && isset($_SESSION['timeout']) && $_SESSION['timeout'] > time()) {
            return $_SESSION['cas_user'];
        } else {
            login();
        }
    }
    return null;
}

if (isset($_GET["service"]) && isset($_GET["ticket"])) {
    echo get_username();
}
