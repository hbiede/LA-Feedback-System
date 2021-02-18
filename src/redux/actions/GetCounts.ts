/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';
import { CourseCount } from 'redux/modules/Types';
import ServiceInterface from 'statics/ServiceInterface';

type CountResponse = {
  count: string;
  course: string;
};

/**
 * Gets the number of interactions per course in the last 7 days
 */
const getCounts = async (): Promise<CourseCount[]> => {
  let courses: CountResponse[] = [];

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  await fetch(`${ServiceInterface.getPath()}/counts.php`, requestOptions)
    .then((response: Response) => response.json())
    .then((json: CountResponse[]) => {
      courses = json;
    })
    .catch((error) =>
      api.getState().setResponse({ class: 'danger', content: error })
    );
  return courses.map((avg: CountResponse) => ({
    ...avg,
    count: Number.parseFloat(avg.count),
  }));
};

export default getCounts;
