#----------------------------------------------------------------------------
#-- Copyright (c) 2020.
#--
#-- File created by Hundter Biede for the UNL CSE Learning Assistant Program
#----------------------------------------------------------------------------

drop table if exists feedback;
drop table if exists interactions;
drop table if exists cse_usernames;

create table cse_usernames
(
    username_key int auto_increment unique primary key,
    username     varchar(20) not null,
    name         varchar(70),
    course       varchar(10),
    constraint cse_usernames_username_key_uindex
        unique (username_key),
    constraint cse_usernames_username_uindex
        unique (username)
);

create table interactions
(
    interaction_key       int auto_increment unique primary key,
    la_username_key       int                                    not null,
    student_username_key  int                                    not null,
    course                varchar(10),
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

create table feedback
(
    feedback_key     int auto_increment unique primary key,
    interaction_key  int                  not null,
    rating           tinyint(2) default 0 null,
    comment          varchar(500)         null,
    desires_feedback tinyint(1)           null,
    time_to_complete int                  null,
    constraint interaction_key
        unique (interaction_key),
    constraint feedback_interaction_fk
        foreign key (interaction_key) references interactions (interaction_key)
            on delete cascade
);

CREATE VIEW interactions_readable AS
SELECT time_of_interaction,
       IFNULL(cul.name, cul.username) AS 'la',
       IFNULL(cus.name, cus.username) AS 'student',
       i.course,
       seeking_feedback,
       has_received_feedback
FROM interactions i
         LEFT JOIN cse_usernames cul on i.la_username_key = cul.username_key
         LEFT JOIN cse_usernames cus on i.student_username_key = cus.username_key
ORDER BY time_of_interaction
