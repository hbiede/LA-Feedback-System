drop table if exists learningassistants.feedback;
drop table if exists learningassistants.interactions;
drop table if exists learningassistants.cse_usernames;

create table learningassistants.cse_usernames
(
    username_key int auto_increment unique primary key,
    username     varchar(20) not null,
    name         varchar(70),
    constraint cse_usernames_username_key_uindex
        unique (username_key),
    constraint cse_usernames_username_uindex
        unique (username)
);

create table learningassistants.interactions
(
    interaction_key       int auto_increment unique primary key,
    student_username_key  int                  not null,
    la_username_key       int                  not null,
    course                varchar(10),
    seeking_feedback      tinyint(1) default 0 not null,
    has_received_feedback tinyint(1) default 0 null,
    time_of_interaction   timestamp  default current_timestamp() not null,
    constraint interactions_interaction_key_uindex
        unique (interaction_key),
    constraint interactions_la_fk
        foreign key (la_username_key) references learningassistants.cse_usernames (username_key)
            on delete cascade,
    constraint interactions_student_fk
        foreign key (student_username_key) references learningassistants.cse_usernames (username_key)
            on delete cascade
);

create table learningassistants.feedback
(
    feedback_key    int auto_increment unique primary key,
    interaction_key int                  not null,
    rating          tinyint(5) default 0 null,
    comment         varchar(500)         null,
    constraint interaction_key
        unique (interaction_key),
    constraint feedback_interaction_fk
        foreign key (interaction_key) references learningassistants.interactions (interaction_key)
            on delete cascade
);

