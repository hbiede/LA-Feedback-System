// @flow
export type InteractionRecord = {
  username: string;
  name?: string;
  count: number;
  avg: number;
};

export type RatingRecord = {
  rating: number;
  comment?: string;
};
