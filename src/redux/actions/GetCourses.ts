/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';

import ServiceInterface from 'statics/ServiceInterface';

/**
 * Gets the current announcements. If more than one announcement exists,
 * the most specific course announcement will be received.
 */
const getCourses = async (): Promise<string[]> => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let result: string[] = [];
  await fetch(`${ServiceInterface.getPath()}/courseList.php`, requestOptions)
    .then((response: Response) => response.json())
    .then((json) => {
      result = json;
      if (result.length === 0) {
        api.getState().setResponse({
          class: 'danger',
          content: 'No courses in database',
        });
      }
    });
  return result;
};

export default getCourses;
