#----------------------------------------------------------------------------
#-- Copyright (c) 2020.
#--
#-- File created by Hundter Biede for the UNL CSE Learning Assistant Program
#----------------------------------------------------------------------------

drop table if exists feedback;
drop table if exists interactions;
drop table if exists logins;
drop table if exists cse_usernames;
drop table if exists announcements;
drop view if exists course_interactions;
drop view if exists feedback_readable;
drop view if exists interactions_readable;
drop view if exists la_interactions;
drop view if exists logins_readable;
drop view if exists outstanding_feedback_req;
drop view if exists weekly_interactions;
drop view if exists interaction_type_readable;

CREATE TABLE cse_usernames
(
    username_key    int auto_increment unique primary key,
    username        varchar(20),
    canvas_username varchar(20),
    name            varchar(70),
    course          varchar(10),
    email           varchar(100),
    constraint cse_usernames_uindex
        unique (username, canvas_username, course)
);

CREATE TABLE interactions
(
    interaction_key       int auto_increment unique primary key,
    la_username_key       int                                    not null,
    student_username_key  int                                    not null,
    course                varchar(10),
    interaction_type      varchar(30)                            null,
    seeking_feedback      tinyint(1) default 0                   not null,
    has_received_feedback tinyint(1) default 0                   null,
    time_of_interaction   timestamp  default current_timestamp() not null,
    constraint interactions_interaction_key_uindex
        unique (interaction_key),
    constraint interactions_la_fk
        foreign key (la_username_key) references cse_usernames (username_key)
            on delete cascade,
    constraint interactions_student_fk
        foreign key (student_username_key) references cse_usernames (username_key)
            on delete cascade
);

CREATE TABLE logins
(
    login_key           int auto_increment unique primary key,
    la_username_key     int                                   not null,
    time_of_interaction timestamp default current_timestamp() not null,
    constraint interactions_la_login_fk
        foreign key (la_username_key) references cse_usernames (username_key)
            on delete cascade
);

CREATE TABLE feedback
(
    feedback_key     int auto_increment unique primary key,
    interaction_key  int                  not null,
    rating           tinyint(2) default 0 null,
    comment          varchar(500)         null,
    sentiment        int                  null,
    desires_feedback tinyint(1)           null,
    time_to_complete int                  null,
    constraint interaction_key
        unique (interaction_key),
    constraint feedback_interaction_fk
        foreign key (interaction_key) references interactions (interaction_key)
            on delete cascade
);

CREATE TABLE announcements
(
    announcement_key int                not null primary key auto_increment,
    course           varchar(20) unique null,
    class            varchar(20)        null, # Type of announcement ('primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark')
    body             varchar(500)       null
);

CREATE VIEW interactions_readable AS
SELECT time_of_interaction,
       IFNULL(cul.name, cul.username) AS 'la',
       IFNULL(cus.name, cus.username) AS 'student',
       i.course,
       interaction_type,
       seeking_feedback,
       has_received_feedback
FROM interactions i
         LEFT JOIN cse_usernames cul on i.la_username_key = cul.username_key
         LEFT JOIN cse_usernames cus on i.student_username_key = cus.username_key
ORDER BY time_of_interaction;

CREATE VIEW feedback_readable AS
SELECT IFNULL(name, username)               AS 'la',
       rating,
       i.course,
       comment,
       IFNULL(CONCAT(sentiment, '%'), null) AS sentiment,
       interaction_type,
       time_of_interaction
FROM feedback
         LEFT JOIN interactions i on feedback.interaction_key = i.interaction_key
         LEFT JOIN cse_usernames cu on i.la_username_key = cu.username_key
ORDER BY username, time_of_interaction;

CREATE VIEW outstanding_feedback_req AS
SELECT 'outstanding feedback requests'                            AS 'category',
       CONCAT(COUNT(*), ' (', (SELECT (SELECT COUNT(*) AS 'count'
                                       FROM interactions
                                       WHERE seeking_feedback = 1
                                         AND has_received_feedback = 0) / COUNT(*) * 100
                               FROM interactions
                               WHERE seeking_feedback = 1), '%)') AS 'count'
FROM interactions
WHERE seeking_feedback = 1
  AND has_received_feedback = 0
UNION
SELECT 'completed feedback requests'                              AS 'category',
       CONCAT(COUNT(*), ' (', (SELECT (SELECT COUNT(*)
                                       FROM interactions
                                       WHERE seeking_feedback = 1
                                         AND has_received_feedback = 1) / COUNT(*) * 100
                               FROM interactions
                               WHERE seeking_feedback = 1), '%)') AS 'count'
FROM interactions
WHERE seeking_feedback = 1
  AND has_received_feedback = 1
UNION
SELECT '---', '---'
UNION
SELECT 'total feedback requests' AS 'category', COUNT(*) AS 'count'
FROM interactions
WHERE seeking_feedback = 1;

CREATE VIEW logins_readable AS
SELECT time_of_interaction,
       IFNULL(cul.name, cul.username) AS 'la'
FROM logins l
         LEFT JOIN cse_usernames cul on l.la_username_key = cul.username_key
ORDER BY time_of_interaction;

CREATE VIEW course_interactions AS
SELECT course, COUNT(*) AS 'count'
FROM interactions
GROUP BY course
UNION
SELECT 'total', COUNT(*) AS 'count'
FROM interactions;

CREATE VIEW weekly_interactions AS
SELECT IFNULL(cu.name, cu.username) AS 'name',
       cu.course                    AS 'course',
       COUNT(0)                     AS 'interactions',
       AVG(f.rating)                AS 'avg_rating'
FROM interactions
         LEFT JOIN cse_usernames cu ON cu.username_key = interactions.la_username_key
         LEFT JOIN feedback f ON interactions.interaction_key = f.interaction_key
WHERE interactions.time_of_interaction >= curdate() - INTERVAL 7 DAY
GROUP BY cu.username
ORDER BY cu.username;

CREATE VIEW la_interactions AS
SELECT IFNULL(cul.name, cul.username) AS 'la',
       COUNT(i.interaction_key)       AS 'count',
       MAX(time_of_interaction)       AS 'latest',
       COUNT(f.interaction_key)       AS 'pieces of feedback',
       AVG(f.rating)                  AS 'average feedback'
FROM interactions i
         LEFT JOIN cse_usernames cul on la_username_key = cul.username_key
         LEFT JOIN feedback f on i.interaction_key = f.interaction_key
GROUP BY cul.username
UNION
SELECT 'total', COUNT(*) AS 'count', MAX(time_of_interaction), COUNT(f.interaction_key), AVG(f.rating)
FROM interactions
         LEFT JOIN feedback f on interactions.interaction_key = f.interaction_key;

CREATE VIEW interaction_type_readable AS
SELECT interaction_type,
       COUNT(*)                                                          AS 'count',
       CONCAT(COUNT(*) / (SELECT COUNT(*) FROM interactions) * 100, '%') AS 'percent'
FROM interactions
GROUP BY interaction_type
UNION
SELECT '---', '---', '---'
UNION
SELECT 'total', COUNT(*), '100%'
FROM interactions;
