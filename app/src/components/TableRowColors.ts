/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { LOW_RATING_BAR } from 'statics/Types';

const getRowClass = (rating: number) =>
  rating !== null && !Number.isNaN(rating) && rating < LOW_RATING_BAR
    ? 'table-danger'
    : rating !== null && !Number.isNaN(rating) && rating < LOW_RATING_BAR * 1.25
    ? 'table-warning'
    : '';

export default getRowClass;
