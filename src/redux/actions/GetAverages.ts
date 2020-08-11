/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';
import { CourseAverages } from 'redux/modules/Types';

type AvgResponse = {
  course: string;
  avg: string;
};

const getAverages = async (): Promise<CourseAverages[]> => {
  let avgs: AvgResponse[] = [];

  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  await fetch(
    'https://cse.unl.edu/~learningassistants/LA-Feedback/averages.php',
    requestOptions
  )
    .then((response) => response.json())
    .then((json) => {
      avgs = json;
    })
    .catch((error) => api.getState().setResponse(error));
  return avgs.map((avg) => ({
    ...avg,
    avg: Number.parseFloat(avg.avg),
  }));
};

export default getAverages;
