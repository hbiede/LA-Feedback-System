/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import { GetState } from 'zustand';

import { RatingRecord, RatingResponse } from 'statics/Types';

import { AppReduxState } from 'redux/modules';

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
  await fetch(
    'https://cse.unl.edu/~learningassistants/LA-Feedback/admin.php',
    requestOptions
  )
    .then((response) => response.json())
    .then((json) => {
      const ratingsResponse: RatingResponse[] = json;
      ratings = ratingsResponse.map((rating) => ({
        ...rating,
        time: new Date(
          Date.parse(rating.time.replace(new RegExp(String.raw`\s`), 'T'))
        ),
      }));
    })
    .catch((error) => setResponse(error));
  return ratings;
};

export default getRatings;
