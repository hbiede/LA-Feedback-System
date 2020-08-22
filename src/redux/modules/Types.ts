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
  count: number;
  course: string;
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
  course: string;
  time: number;
};

export type InteractionBreakdown = {
  count: number;
  course: string;
  name: string;
  wcount: number;
};

export const DEFAULT_COURSE_NAME = '---';
