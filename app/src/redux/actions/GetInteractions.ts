/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import { GetState } from 'zustand';

import { InteractionSummary } from 'statics/Types';

import { AppReduxState } from 'redux/modules';

const getInteractions = async (
  state: GetState<AppReduxState>
): Promise<InteractionSummary> => {
  const { username, setResponse } = state();
  let interactions: InteractionSummary = { ratings: [], time: -1 };
  if (username !== 'INVALID_TICKET_KEY') {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username }),
    };
    await fetch(
      'https://cse.unl.edu/~learningassistants/LA-Feedback/admin.php',
      requestOptions
    )
      .then((response) => response.json())
      .then((json) => {
        if (Array.isArray(json)) {
          interactions = {
            ratings: json,
            time: -1,
          };
        } else {
          interactions = json;
          if (interactions.time === null) {
            interactions.time = 0;
          }
        }
      })
      .catch((error) => setResponse(error));
  }
  return interactions;
};

export default getInteractions;
