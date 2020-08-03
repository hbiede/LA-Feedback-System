/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

// @flow
export type SetSelectedUsernameArgs = {
  username: string;
}

export type SetCourseArgs = {
  course: string;
}

export type SetNameArgs = {
  name: string;
}

export type Response = {
  class: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  content: string;
}
