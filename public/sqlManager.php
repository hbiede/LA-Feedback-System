<?php
/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

function get_connection() {
    $sql_info = json_decode(file_get_contents("data/sql.json"));
    $conn = new mysqli($sql_info->{'url'}, $sql_info->{'username'}, $sql_info->{'password'});
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

function get_name_from_interaction($interaction_id) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT username,name FROM cse_usernames WHERE username_key=(SELECT la_username_key FROM interactions WHERE interaction_key = ?);');
    if (!$ps) {
        error_log('Failed to build prepped statement');
        $conn->close();
        return 'ERROR1';
    }
    $ps->bind_param('i', $interaction_id);
    $ps->execute();
    if ($ps->error) {
        error_log($ps->error);
    }
    $results = $ps->get_result()->fetch_assoc();
    $la_username = $results['username'];
    $la_name = $results['name'];
    $ps->close();
    $conn->close();
    return ($la_name === null || strlen(trim($la_name)) === 0) ? $la_username : $la_name;
}

function get_course_from_interaction($interaction_id) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT course FROM interactions WHERE interaction_key = ?;');
    if (!$ps) {
        error_log('Failed to build prepped statement');
        $conn->close();
        return 'ERROR1';
    }
    $ps->bind_param('i', $interaction_id);
    $ps->execute();
    if ($ps->error) {
        error_log($ps->error);
    }
    $result = $ps->get_result()->fetch_assoc()['course'];
    $ps->close();
    $conn->close();
    return $result;
}

function get_interaction_type_from_interaction($interaction_id) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT interaction_type FROM interactions WHERE interaction_key = ?;');
    if (!$ps) {
        error_log('Failed to build prepped statement');
        $conn->close();
        return 'ERROR1';
    }
    $ps->bind_param('i', $interaction_id);
    $ps->execute();
    if ($ps->error) {
        error_log($ps->error);
    }
    $result = $ps->get_result()->fetch_assoc()['interaction_type'];
    $ps->close();
    $conn->close();
    return $result;
}

function get_la_username_from_interaction($interaction_id) {
    return get_username_from_interaction(
        'SELECT username FROM cse_usernames WHERE username_key=(SELECT la_username_key FROM interactions WHERE interaction_key = ?);',
        $interaction_id
    );
}

function get_student_username_from_interaction($interaction_id) {
    return get_username_from_interaction(
        'SELECT username FROM cse_usernames WHERE username_key=(SELECT student_username_key FROM interactions WHERE interaction_key = ?);',
        $interaction_id
    );
}

function get_username_from_interaction($query, $interaction_id) {
    $conn = get_connection();
    $ps = $conn->prepare($query);
    if (!$ps) {
        error_log('Failed to build prepped statement');
        $conn->close();
        return 'ERROR1';
    }
    $ps->bind_param('i', $interaction_id);
    $ps->execute();
    if ($ps->error) {
        error_log($ps->error);
    }
    $la_username = $ps->get_result()->fetch_assoc()['username'];
    $ps->close();
    $conn->close();
    return $la_username;
}

function can_give_feedback($interaction_id) {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT has_received_feedback,seeking_feedback FROM interactions WHERE interaction_key=?;');
    if (!$ps) {
        error_log('Failed to build prepped statement');
        $conn->close();
        return 'ERROR1';
    }
    $ps->bind_param('i', $interaction_id);
    $ps->execute();
    if ($ps->error) {
        error_log($ps->error);
    }

    $result = $ps->get_result()->fetch_assoc();
    $can_give = $result['seeking_feedback'];
    $given = $result['has_received_feedback'];
    $ps->close();
    $conn->close();
    return $can_give && !$given;
}

function add_cse($username) {
    $conn = get_connection();
    if ($conn !== null) {
        $conn->begin_transaction();
        $ps = $conn->prepare("INSERT INTO cse_usernames (username) VALUE (?);");
        if ($ps) {
            $ps->bind_param("s", $username);
            $ps->execute();
            $return_val = $ps->insert_id;
            $conn->commit();

            $ps->close();
            $conn->close();
            return $return_val;
        } else {
            $conn->close();
            error_log("Failed to build prepped statement for adding CSE username $username");
        }
    }
    return null;
}

function add_interaction($la_cse, $student_id, $course, $interaction_type) {
    $la_id = get_username_id($la_cse);
    if ($la_id === $student_id) return null;
    $conn = get_connection();
    if ($conn !== null && is_int($la_id) && is_int($student_id)) {
        $conn->begin_transaction();
        $ps = $conn->prepare("INSERT INTO interactions (la_username_key, student_username_key, course, " .
            "interaction_type) VALUE (?, ?, ?, ?);");
        if ($ps) {
            $ps->bind_param("siss", $la_id, $student_id, $course, $interaction_type);
            $ps->execute();
            if ($ps->error) {
                error_log($ps->error);
            } else {
                $conn->commit();
                $returnVal = $ps->insert_id;

                $ps->close();
                $conn->close();

                return $returnVal;
            }
        } else {
            error_log("Failed to build prepped statement to add interaction between $la_cse and $student_id");
        }
    } else {
        error_log('Failed to add interaction for { la: ' . $la_cse . ', student: ' . $student_id . ' }');
    }
    $conn->close();
    return null;
}

function update_interaction_for_feedback($interaction_id) {
    $conn = get_connection();
    if ($conn !== null && is_int($interaction_id) && $interaction_id > 0) {
        $conn->begin_transaction();
        $ps = $conn->prepare("UPDATE interactions SET seeking_feedback=true WHERE interaction_key=?;");
        if ($ps) {
            $ps->bind_param("s", $interaction_id);
            $ps->execute();
            $conn->commit();

            $ps->close();
        } else {
            error_log("Failed to build prepped statement for updating interaction $interaction_id");
        }
        $conn->close();
    } else {
        error_log("Failed to update interaction for { id: $interaction_id }");
    }
}

function has_been_a_week($username) {
    $conn = get_connection();
    if ($conn !== null) {
        $ps = $conn->prepare("SELECT COUNT(*) AS 'count' FROM interactions " .
            "LEFT JOIN cse_usernames cu ON cu.username_key = interactions.la_username_key WHERE cu.username = ? " .
            "AND time_of_interaction > (CURRENT_DATE() - INTERVAL 7 DAY)");
        if ($ps) {
            $ps->bind_param("s", $username);
            $ps->execute();

            $result = $ps->get_result()->fetch_assoc()['count'];
            if ($result !== null) {

                $ps->close();
                $conn->close();
                return $result === 0;
            }
        } else {
            error_log("Failed to build prepped statement for checking if $username has recent interactions");
        }
        $ps->close();
        $conn->close();
        return false;
    }
    return false;
}

function received_email_today($student_id) {
    $conn = get_connection();
    if ($conn !== null && $student_id !== null) {
        $ps = $conn->prepare("SELECT time_of_interaction AS time FROM interactions WHERE seeking_feedback = 1 " .
            "AND student_username_key = ? " .
            "ORDER BY time_of_interaction DESC LIMIT 1;");
        if ($ps) {
            $ps->bind_param("s", $student_id);
            $ps->execute();

            $result = $ps->get_result()->fetch_assoc()['time'];
            if ($result !== null) {

                $time = date_create($result);

                $ps->close();
                $conn->close();
                $today = new DateTime();
                $today->setTime(0, 0);
                return $time > $today;
            } else {
                $ps->close();
                $conn->close();
                return false;
            }
        } else {
            error_log("Failed to build prepped statement for checking if $student_id received an email");
            $ps->close();
            $conn->close();
            return false;
        }
    }
    return false;
}

function get_username_id($username) {
    if ($username === null || strlen(trim($username)) === 0) return null;

    $conn = get_connection();
    if ($conn !== null) {
        $ps = $conn->prepare("SELECT username_key FROM cse_usernames WHERE username = ?;");
        if (!$ps) {
            error_log("Failed to build prepped statement for getting username ID for $username");
            $conn->close();
            return null;
        }

        $id = -1;
        $ps->bind_param("s", $username);
        $ps->execute();
        $ps->bind_result($id);
        $ps->fetch();
        if ($ps->num_rows() == -1) {
            $id = add_cse($username);
        }
        $ps->close();
        $conn->close();
        return $id;
    }
    return null;
}

function get_course_counts() {
    $conn = get_connection();
    $ps = $conn->prepare('SELECT course, COUNT(course) AS count FROM interactions WHERE course IS NOT NULL GROUP BY course ORDER BY course;');
    if ($ps) {
        $ps->execute();
        $results = $ps->get_result();
        $returnVal = [];
        while ($row = $results->fetch_assoc()) {
            array_push($returnVal, $row);
        }
        return $returnVal;
    } else {
        error_log('Failed to prep statement for getting course counts');
        $conn->close();
        return [];
    }
}

function get_email($student_id) {
    if ($student_id === null) return null;

    $conn = get_connection();
    $result = null;
    if ($conn !== null) {
        $ps = $conn->prepare("SELECT IFNULL(email, CONCAT(username, '@cse.unl.edu')) AS 'email' " .
            "FROM cse_usernames WHERE username_key=?;");
        if ($ps) {
            $ps->bind_param("i", $student_id);
            $ps->execute();
            $assoc = $ps->get_result()->fetch_assoc();
            if ($assoc) {
                $result = $assoc['email'];
            } else if ($ps->error) {
                error_log($ps->error);
            }
            $ps->close();
        } else {
            error_log("Failed to build prepped statement for getting email for $student_id");
        }
    }
    $conn->close();
    return $result;
}
