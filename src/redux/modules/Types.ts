/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

export type SetSelectedUsernameArgs = {
  username: string;
};

export type SetCourseArgs = {
  course: string;
};

export type SetNameArgs = {
  name: string;
};

export type CourseCount = {
  course: string;
  count: number;
};

export type ResponseMessage = {
  class:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';
  content: string | Element;
};

export type InteractionTime = {
  time: number;
  course: string;
};

export type InteractionBreakdown = {
  name: string;
  course: string;
  count: number;
  wcount: number;
};

export const DEFAULT_COURSE_NAME = '---';
