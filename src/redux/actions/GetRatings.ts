/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { GetState } from 'zustand';

import ServiceInterface from 'statics/ServiceInterface';

import { AppReduxState } from 'redux/modules';
import { DEFAULT_COURSE_NAME } from 'redux/modules/Types';

import { RatingRecord, RatingResponse } from 'statics/Types';

const getRatings = async (
  get: GetState<AppReduxState>
): Promise<RatingRecord[]> => {
  const { username, selectedUsername, setResponse } = get();

  let ratings: RatingRecord[] = [];
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: username, la: selectedUsername }),
  };
  await fetch(`${ServiceInterface.getPath()}/admin.php`, requestOptions)
    .then((response) => response.json())
    .then((json) => {
      const ratingsResponse: RatingResponse[] = json;
      ratings = ratingsResponse.map((rating) => ({
        ...rating,
        course: rating.course ?? DEFAULT_COURSE_NAME,
        time: new Date(rating.time),
        rating: Number.parseFloat(rating.rating),
      }));
    })
    .catch((error) => setResponse(error));
  return ratings;
};

export default getRatings;
