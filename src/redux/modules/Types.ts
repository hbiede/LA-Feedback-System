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

export const ALERT_CLASSES = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'light',
  'dark',
] as const;
export type ResponseClass = typeof ALERT_CLASSES[number];

export type ResponseMessage = {
  class?: ResponseClass;
  content?: string | JSX.Element;
  /**
   * @default true
   */
  dismissable?: boolean;
};

export type InteractionBreakdown = {
  count: number;
  course: string;
  name: string;
  wcount: number;
};

export const DEFAULT_COURSE_NAME = '---';

export type Student = {
  canvas_username: string;
  course: string;
  id: number;
  interaction_count: number;
  name?: string;
  username?: string;
};
