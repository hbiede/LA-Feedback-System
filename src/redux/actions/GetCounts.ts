/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';
import { CourseCount } from 'redux/modules/Types';

type CountResponse = {
  count: string;
  course: string;
};

const getCounts = async (): Promise<CourseCount[]> => {
  let courses: CountResponse[] = [];

  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  await fetch(
    'https://cse.unl.edu/~learningassistants/LA-Feedback/counts.php',
    requestOptions
  )
    .then((response) => response.json())
    .then((json) => {
      courses = json;
    })
    .catch((error) => api.getState().setResponse(error));
  return courses.map((avg) => ({
    ...avg,
    count: Number.parseFloat(avg.count),
  }));
};

export default getCounts;
