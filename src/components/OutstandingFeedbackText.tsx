/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React from 'react';

import shallow from 'zustand/shallow';

import Redux, { AppReduxState } from 'redux/modules';

const OutstandingFeedbackText = () => {
  const { interactions } = Redux(
    (state: AppReduxState) => ({
      interactions: state.interactions,
    }),
    shallow
  );
  const { outstanding } = interactions;
  const ratingCount = interactions.ratings.length;

  return (
    <>
      {outstanding > 0 && (
        <p>
          {outstanding} unanswered feedback requests ({ratingCount} requested)
        </p>
      )}
    </>
  );
};

export default OutstandingFeedbackText;
