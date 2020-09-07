/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { GetState } from 'zustand';

import ServiceInterface from 'statics/ServiceInterface';

import { AppReduxState } from 'redux/modules';

import { InteractionSummary } from 'statics/Types';

type InteractionResponseRecord = {
  avg: string;
  count: string;
  course: string;
  fCount: string;
  username: string;
  name?: string;
};

type InteractionResponseSummary = {
  outstanding: string | null;
  ratings: InteractionResponseRecord[];
  time: string | null;
};

const getInteractions = async (
  state: GetState<AppReduxState>
): Promise<InteractionSummary> => {
  const { username, setResponse } = state();
  let interactions: InteractionSummary = {
    outstanding: 0,
    ratings: [],
    time: -1,
  };
  if (username !== 'INVALID_TICKET_KEY') {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username }),
    };
    await fetch(`${ServiceInterface.getPath()}/admin.php`, requestOptions)
      .then((response) => response.json())
      .then((json) => {
        if (Array.isArray(json)) {
          interactions = {
            outstanding: 0,
            ratings: json,
            time: -1,
          };
        } else {
          const intHolder: InteractionResponseSummary = json;
          interactions.time =
            intHolder.time === null ? 0 : Number.parseFloat(intHolder.time);
          interactions.outstanding =
            intHolder.outstanding === null
              ? 0
              : Number.parseFloat(intHolder.outstanding);
          interactions.ratings = intHolder.ratings
            .map((rating) => ({
              ...rating,
              avg: Number.parseFloat(rating.avg),
              course: rating.course ?? '---',
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
