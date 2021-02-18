/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React from 'react';

export type InteractionRecord = {
  avg: number | null;
  count: number;
  fCount: number;
  username: string;
  wCount: number;
  course?: string;
  name?: string;
};

export type InteractionSummary = {
  isAdmin: boolean;
  outstanding: number;
  ratings: InteractionRecord[];
  sentiment: number | null;
  time: number | null;
};

export type SortConfig = {
  column: string;
  order: number;
};

export type RatingRecord = {
  course: string;
  rating: number;
  time: Date;
  comment?: string | null;
  sentiment?: number | null;
};

export type RatingResponse = {
  course: string;
  rating: string;
  time: string;
  comment?: string;
};

export type RESTResponse = {
  course?: string;
  name?: string;
};

type StyleTypes = React.CSSProperties;
export type NamedStyles<T> = {
  [P in keyof T]: StyleTypes;
};
export type StyleDef<T extends string | number | symbol> = Record<
  T,
  StyleTypes
>;

export const COURSES = ['101', '155E', '155N', '156'];

export const SORT_CHARS = new Map<number, string>()
  .set(1, '\u25b2')
  .set(-1, '\u25bc');

export const LOW_RATING_BAR = 5;
