/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React from 'react';

import { InteractionRecord, InteractionSummary } from '../statics/Types';

type Props = {
  interactions: InteractionSummary;
}

const FeedbackTimeText = ({ interactions }: Props) => {
  const { time } = interactions;
  let timeText = null;
  if (time !== null && time > 0) {
    const minutes = Math.floor(time / 1000 / 60);
    const seconds = (time / 1000) % 60;
    const numberOfInteractions = interactions.ratings
      .reduce((acc: number, la: InteractionRecord) => acc + la.count, 0);
    timeText = `Average time to give feedback for ${numberOfInteractions} interaction${
      minutes !== 1 ? 's' : ''}: ${minutes} minute${minutes !== 1 ? 's' : ''}${
      seconds > 1 ? ` and ${seconds.toPrecision(3)} seconds` : ''
    }`;
  }

  return (
    <>
      {timeText && (
      <p>
        {timeText}
      </p>
      )}
    </>
  );
};

export default FeedbackTimeText;
