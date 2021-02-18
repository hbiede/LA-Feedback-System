/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { LOW_RATING_BAR } from 'statics/Types';

/**
 * Allows coloration of table rows based on the LOW_RATING_BAR
 *
 * @param rating The rating to be colored
 * @see LOW_RATING_BAR
 */
const getRowClass = (rating: number): string =>
  rating !== null && !Number.isNaN(rating) && rating < LOW_RATING_BAR
    ? 'table-danger'
    : rating !== null && !Number.isNaN(rating) && rating < LOW_RATING_BAR * 1.25
    ? 'table-warning'
    : '';

export default getRowClass;
