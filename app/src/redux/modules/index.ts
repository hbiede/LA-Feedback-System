/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

// @flow
import { create } from 'zustand';

import ServiceInterface from 'statics/ServiceInterface';
import { InteractionSummary, RatingRecord } from 'statics/Types';

import {
  CourseRest,
  GetAverages,
  GetInteractions,
  GetRatings,
  GetTimes,
  GetUsername,
  NameRest,
} from 'redux/actions';

import {
  CourseAverages,
  Response,
  SetCourseArgs,
  SetNameArgs,
  SetSelectedUsernameArgs,
  Time,
} from 'redux/modules/Types';

export type AppReduxState = {
  loading: boolean;
  username: string;
  getUsername: () => void;
  name: string;
  getName: () => void;
  setName: (args: SetNameArgs) => void;
  course: string;
  getCourse: () => void;
  setCourse: (args: SetCourseArgs) => void;
  isAdmin: boolean;
  interactions: InteractionSummary;
  getInteractions: () => void;
  setInteractions: (ints: InteractionSummary) => void;
  selectedUsername: string;
  setSelectedUsername: (args: SetSelectedUsernameArgs) => void;
  ratings: RatingRecord[];
  getRatings: () => void;
  response: Response | null;
  setResponse: (res: Response) => void;
  sendEmail: (studentCSE: string) => void;
  logout: () => void;
  getTimes: () => Promise<Time[]>;
  getAverages: () => Promise<CourseAverages[]>;
};

export const [useStore, api] = create<AppReduxState>((set, get) => ({
  loading: true,
  username: '',
  getUsername: () => {
    GetUsername(set).then(() => {
      const { getCourse, getInteractions: getInts, getName } = api.getState();
      getCourse();
      getInts();
      getName();
    });
  },
  name: '',
  getName: () => NameRest().then((result) => set(() => ({ name: result }))),
  setName: (args: SetNameArgs) => {
    NameRest(args.name).then((result) => set(() => ({ name: result })));
  },
  course: '',
  getCourse: () =>
    CourseRest().then((result) => set(() => ({ course: result }))),
  setCourse: (args: SetCourseArgs) => {
    CourseRest(args.course).then((result) => set(() => ({ course: result })));
  },
  isAdmin: false,
  interactions: { ratings: [], time: -1 },
  getInteractions: () => {
    GetInteractions(get).then((ints) => {
      const isAdmin =
        ints.ratings.length > 0 ||
        (ints.time !== null &&
          !Number.isNaN(ints.time) &&
          Number.isFinite(ints.time));
      const { name, course } = api.getState();
      set(() => ({
        interactions: ints,
        isAdmin,
        loading: false,
        name: isAdmin ? '' : name,
        course: isAdmin ? '' : course,
      }));
    });
  },
  setInteractions: (ints: InteractionSummary) =>
    set(() => ({ interactions: ints })),
  selectedUsername: '',
  setSelectedUsername: (args: SetSelectedUsernameArgs) => {
    set(() => ({ selectedUsername: args.username }));
    const {
      getName,
      getCourse,
      getRatings: getRatingsAction,
      isAdmin,
    } = api.getState();
    getName();
    getCourse();
    if (isAdmin) {
      getRatingsAction();
    }
  },
  ratings: [],
  getRatings: () => {
    GetRatings(get).then((result) => set(() => ({ ratings: result })));
  },
  response: null,
  setResponse: (res: Response) => {
    set(() => ({ response: res }));
    setTimeout(() => set(() => ({ response: null })), 10000); // timeout after 10 seconds
  },
  sendEmail: (studentCSE: string) => {
    const { setResponse } = api.getState();
    ServiceInterface.sendEmail(studentCSE)
      .then((response) => {
        if (response === '0' || response === 0) {
          setResponse({
            class: 'success',
            content: 'Interaction recorded',
          });
        } else {
          setResponse({
            class: 'danger',
            content: `Failed to Send Message. Please Try Again. (Error Code ${response})`,
          });
        }
      })
      .catch((error) => {
        setResponse({
          class: 'danger',
          content: `Failed to Send Message. Please Try Again. (Error: ${error})`,
        });
      });
  },
  logout: () => ServiceInterface.logout(),
  getTimes: GetTimes,
  getAverages: GetAverages,
}));

export default useStore;
