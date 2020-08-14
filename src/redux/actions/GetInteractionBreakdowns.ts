/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';
import { InteractionBreakdown } from 'redux/modules/Types';

export type InteractionBreakdownResponse = {
  username: string;
  name?: string;
  course: string;
  count: string;
  wcount: string;
};

const getBreakdowns = async (): Promise<InteractionBreakdown[]> => {
  let breakdowns: InteractionBreakdownResponse[] = [];

  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  await fetch(
    'https://cse.unl.edu/~learningassistants/LA-Feedback/breakdown.php',
    requestOptions
  )
    .then((response) => response.json())
    .then((json) => {
      breakdowns = json;
    })
    .catch((error) => api.getState().setResponse(error));
  return breakdowns.map((int) => ({
    ...int,
    name: int.name ?? int.username,
    course: int.course ?? '---',
    count: Number.parseInt(int.count, 10),
    wcount: Number.parseInt(int.wcount, 10),
  }));
};

export default getBreakdowns;
