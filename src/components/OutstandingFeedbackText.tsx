/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React from 'react';

import shallow from 'zustand/shallow';

import Redux from 'redux/modules';

const OutstandingFeedbackText = () => {
  const { interactions } = Redux(
    (state) => ({
      interactions: state.interactions,
    }),
    shallow
  );
  const { outstanding } = interactions;

  return (
    <>{outstanding > 0 && <p>{outstanding} unanswered feedback requests</p>}</>
  );
};

export default OutstandingFeedbackText;
