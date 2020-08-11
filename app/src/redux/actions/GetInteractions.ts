/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { GetState } from 'zustand';

import { AppReduxState } from 'redux/modules';

import { InteractionSummary } from 'statics/Types';

type InteractionResponseRecord = {
  username: string;
  name?: string;
  course: string;
  count: string;
  fCount: string;
  avg: string;
};

type InteractionResponseSummary = {
  ratings: InteractionResponseRecord[];
  time: number | null;
};

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
          const intHolder: InteractionResponseSummary = json;
          if (intHolder.time === null) {
            interactions.time = 0;
          }
          interactions.ratings = intHolder.ratings
            .map((rating) => ({
              ...rating,
              avg: Number.parseFloat(rating.avg),
              count: Number.parseInt(rating.count, 10),
              fCount: Number.parseInt(rating.fCount, 10),
            }))
            .filter((int) => int.count > 0);
        }
      })
      .catch((error) => setResponse(error));
  }
  return interactions;
};

export default getInteractions;
