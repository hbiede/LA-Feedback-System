/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

// @flow
export type InteractionRecord = {
  username: string;
  name?: string;
  course: string;
  count: number;
  fCount: number;
  avg: number;
};

export type InteractionSummary = {
  ratings: InteractionRecord[];
  time: number | null;
};

export type SortConfig = {
  column: string;
  order: number;
};

export type RatingRecord = {
  comment?: string;
  course: string;
  rating: number;
  time: Date;
};

export type RatingResponse = {
  comment?: string;
  course: string;
  rating: string;
  time: string;
};

export type RESTResponse = {
  name?: string;
  course?: string;
};

export const COURSES = ['101', '155E', '155N', '156'];

export const SORT_CHARS = new Map<number, string>()
  .set(1, '\u25b2')
  .set(-1, '\u25bc');

export const LOW_RATING_BAR = 5;
