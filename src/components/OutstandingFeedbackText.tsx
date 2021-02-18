/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React from 'react';

import shallow from 'zustand/shallow';

import Redux, { AppReduxState } from 'redux/modules';

/**
 * Displays the number of outstanding feedback requests
 */
const OutstandingFeedbackText = () => {
  const { interactions } = Redux(
    (state: AppReduxState) => ({
      interactions: state.interactions,
    }),
    shallow
  );
  const { outstanding } = interactions;
  const ratingRequestCount = interactions.ratings.length + outstanding;
  const percentComplete = (ratingRequestCount > 0
    ? outstanding / ratingRequestCount
    : 0
  ).toFixed(2);

  return (
    <>
      {outstanding > 0 && (
        <p>
          {outstanding} unanswered feedback requests out of {ratingRequestCount}{' '}
          requested ({percentComplete}% completed)
        </p>
      )}
    </>
  );
};

export default OutstandingFeedbackText;
