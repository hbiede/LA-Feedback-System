/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { GetState } from 'zustand';

import ServiceInterface from 'statics/ServiceInterface';

import { AppReduxState } from 'redux/modules';

import { InteractionSummary } from 'statics/Types';

type LoginResponseRecord = {
  la: string;
  time_of_interaction: string;
};

type InteractionResponseRecord = {
  avg: string;
  count: string;
  course: string;
  fCount: string;
  username: string;
  wCount: string;
  name?: string;
};

type InteractionResponseSummary = {
  isAdmin: boolean;
  logins: LoginResponseRecord[];
  outstanding: string | null;
  ratings: InteractionResponseRecord[];
  sentiment: string | null;
  time: string | null;
};

/**
 * Collects all data for the Admin page
 *
 * @param state The current Redux app state
 */
const getInteractions = async (
  state: GetState<AppReduxState>
): Promise<InteractionSummary> => {
  const { username, setResponse } = state();
  let interactions: InteractionSummary = {
    isAdmin: false,
    logins: [],
    outstanding: 0,
    ratings: [],
    sentiment: -1,
    time: -1,
  };
  if (username !== 'INVALID_TICKET_KEY') {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: username }),
    };
    await fetch(`${ServiceInterface.getPath()}/admin.php`, requestOptions)
      .then((response: Response) => response.json())
      .then((json) => {
        if (Array.isArray(json)) {
          interactions = {
            isAdmin: false,
            logins: [],
            outstanding: 0,
            ratings: json,
            sentiment: -1,
            time: -1,
          };
        } else {
          const intHolder: InteractionResponseSummary = json;
          interactions.isAdmin = intHolder.isAdmin;
          interactions.logins = intHolder.logins.map(
            ({ time_of_interaction, la }) => ({
              la,
              timeOfInteraction: new Date(
                Number.parseInt(time_of_interaction, 10) * 1000 // Convert UNIX time stamp to date
              ),
            })
          );
          interactions.time =
            intHolder.time === null ? 0 : Number.parseFloat(intHolder.time);
          interactions.outstanding =
            intHolder.outstanding === null
              ? 0
              : Number.parseFloat(intHolder.outstanding);
          interactions.sentiment =
            intHolder.sentiment === null
              ? null
              : Number.parseFloat(intHolder.sentiment);
          interactions.ratings = intHolder.ratings
            .map((rating) => ({
              ...rating,
              avg: Number.parseFloat(rating.avg),
              course: rating.course ?? '---',
              count: Number.parseInt(rating.count, 10),
              wCount: Number.parseInt(rating.wCount, 10),
              fCount: Number.parseInt(rating.fCount, 10),
            }))
            .filter((int) => int.count > 0);
        }
      })
      .catch((error) => setResponse({ class: 'danger', content: error }));
  }
  return interactions;
};

export default getInteractions;
