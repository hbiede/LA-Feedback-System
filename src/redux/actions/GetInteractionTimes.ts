/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';
import { InteractionTime } from 'redux/modules/Types';
import ServiceInterface from 'statics/ServiceInterface';

type TimeResponse = {
  course: string;
  time_of_interaction: string;
};

const getInteractionTimes = async (): Promise<InteractionTime[]> => {
  let times: InteractionTime[] = [];
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  await fetch(`${ServiceInterface.getPath()}/times.php`, requestOptions)
    .then((response: Response) => response.json())
    .then((json: TimeResponse[]) => {
      times = json.map((time) => ({
        time: new Date(
          Date.parse(
            time.time_of_interaction.replace(new RegExp(String.raw`\s`), 'T')
          )
        ).getUTCHours(),
        course: time.course,
      }));
    })
    .catch((error) => api.getState().setResponse(error));
  return times;
};

export default getInteractionTimes;
