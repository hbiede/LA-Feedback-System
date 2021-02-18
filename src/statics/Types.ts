/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React from 'react';

/**
 * The information used to summarize a single LA's interaction for an admin
 */
export type InteractionRecord = {
  /**
   * The average feedback rating
   */
  avg: number | null;
  /**
   * The number of interactions
   */
  count: number;
  /**
   * The number of pieces of feedback
   */
  fCount: number;
  /**
   * The username for the LA
   */
  username: string;
  /**
   * The number of interactions in the last week
   */
  wCount: number;
  /**
   * The course associated with the LA
   */
  course?: string;
  /**
   * The real name of the LA
   */
  name?: string;
};

/**
 * All data needed to display admin stats
 */
export type InteractionSummary = {
  /**
   * If the currently logged in user is an admin
   */
  isAdmin: boolean;
  /**
   * The number of outstanding pieces of feedback
   */
  outstanding: number;
  /**
   * The ratings for all LAs
   *
   * @see InteractionRecord
   */
  ratings: InteractionRecord[];
  /**
   * The average sentiment of all feedback
   */
  sentiment: number | null;
  /**
   * The number of milliseconds all students took to fill out the feedback form, on average
   */
  time: number | null;
};

/**
 * The config for a sorted table
 */
export type SortConfig = {
  /**
   * The id of the column being sorted on
   */
  column: string;
  /**
   * The comparator-based order to sort ascending or descending
   */
  order: number;
};

/**
 * The ratings used to display data on the website
 */
export type RatingRecord = {
  /**
   * The course for which the feedback was given
   */
  course: string;
  /**
   * The numerical rating given
   */
  rating: number;
  /**
   * The time of the interaction
   */
  time: Date;
  /**
   * The comment given by the student on this feedback
   */
  comment?: string | null;
  /**
   * The sentiment rating of the comment
   */
  sentiment?: number | null;
};

/**
 * The data returned by the rating REST API
 */
export type RatingResponse = {
  /**
   * The course
   */
  course: string;
  rating: string;
  time: string;
  comment?: string;
};

/**
 * The return value when an LA's data is modified
 */
export type RESTResponse = {
  course?: string;
  name?: string;
};

/**
 * CSS typing
 */
type StyleTypes = React.CSSProperties;
/**
 * Used to create an object full of CSS
 */
export type NamedStyles<T> = {
  [P in keyof T]: StyleTypes;
};
/**
 * Used to type a NamedStyle object
 */
export type StyleDef<T extends string | number | symbol> = Record<
  T,
  StyleTypes
>;

/**
 * All current courses
 */
export const COURSES = ['101', '155E', '155N', '156'];

/**
 * The characters used to display sort order
 */
export const SORT_CHARS = new Map<number, string>()
  .set(1, '\u25b2')
  .set(-1, '\u25bc');

/**
 * The value at which ratings/average ratings are marked as a warning
 */
export const LOW_RATING_BAR = 5;
