/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React from 'react';

import shallow from 'zustand/shallow';

import Redux, { AppReduxState } from 'redux/modules';

/**
 * Calculates average feedback sentiment
 */
const SentimentText = () => {
  const { interactions } = Redux(
    (state: AppReduxState) => ({
      interactions: state.interactions,
    }),
    shallow
  );
  const { sentiment } = interactions;

  return (
    <>
      {sentiment !== null && sentiment > 0 && (
        <p>{sentiment.toFixed(2)}% average sentiment</p>
      )}
    </>
  );
};

export default SentimentText;
