/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

// @flow
import { create } from 'zustand';

import ServiceInterface from '../../statics/ServiceInterface';
import { InteractionSummary, RatingRecord } from '../../statics/Types';

import courseREST from '../actions/GetCourse';
import getInteractions from '../actions/GetInteractions';
import getRatings from '../actions/GetRatings';
import getUsername from '../actions/GetUsername';
import nameREST from '../actions/GetName';

import {
  Response, SetCourseArgs, SetNameArgs, SetSelectedUsernameArgs,
} from './Types';

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
  response: Response|null;
  setResponse: (res: Response) => void;
  sendEmail: (studentCSE: string) => void;
  logout: () => void;
};

export const [useStore, api] = create<AppReduxState>((set, get) => ({
  loading: true,
  username: '',
  getUsername: () => {
    getUsername(set).then(() => {
      const { getCourse, getInteractions: getInts, getName } = api.getState();
      getCourse();
      getInts();
      getName();
    });
  },
  name: '',
  getName: () => (nameREST().then((result) => set(() => ({ name: result })))),
  setName: (args: SetNameArgs) => {
    nameREST(args.name).then((result) => set(() => ({ name: result })));
  },
  course: '',
  getCourse: () => (courseREST().then((result) => set(() => ({ course: result })))),
  setCourse: (args: SetCourseArgs) => {
    courseREST(args.course).then((result) => set(() => ({ course: result })));
  },
  isAdmin: false,
  interactions: { ratings: [], time: -1 },
  getInteractions: () => {
    getInteractions(get).then((ints) => {
      const isAdmin = ints.ratings.length > 0
        || (ints.time !== null
          && !Number.isNaN(ints.time)
          && Number.isFinite(ints.time));
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
  setInteractions: (ints: InteractionSummary) => set(() => ({ interactions: ints })),
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
    getRatings(get).then((result) => set(() => ({ ratings: result })));
  },
  response: null,
  setResponse: (res: Response) => {
    set(() => ({ response: res }));
    setTimeout(() => set(() => ({ response: null })), 10000); // timeout after 10 seconds
  },
  sendEmail: (studentCSE: string) => {
    const { setResponse } = api.getState();
    ServiceInterface.sendEmail(studentCSE).then((response) => {
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
    }).catch((error) => {
      setResponse({
        class: 'danger',
        content: `Failed to Send Message. Please Try Again. (Error: ${error})`,
      });
    });
  },
  logout: () => (ServiceInterface.logout()),
}));

export default useStore;
