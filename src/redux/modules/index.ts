/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import create from 'zustand';

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

import ServiceInterface from 'statics/ServiceInterface';
import { InteractionSummary, RatingRecord } from 'statics/Types';

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
  setResponse: (res: Response | null) => void;
  sendEmail: (
    studentCSE: string | null,
    course?: string | null,
    multiples?: boolean
  ) => void;
  logout: () => void;
  getTimes: () => Promise<Time[]>;
  getAverages: () => Promise<CourseAverages[]>;
};

export const [useStore, api] = create<AppReduxState>((set, get) => ({
  loading: true,
  username: '',
  getUsername: () => {
    GetUsername(set).then(() => {
      get().getName();
      get().getCourse();
      get().getInteractions();
    });
  },
  name: '',
  getName: () => NameRest().then((result) => set(() => ({ name: result }))),
  setName: (args: SetNameArgs) => {
    if (get().name !== args.name) {
      NameRest(args.name).then(() => set(() => ({ name: args.name })));
    }
  },
  course: '',
  getCourse: () =>
    CourseRest().then((result) => set(() => ({ course: result }))),
  setCourse: (args: SetCourseArgs) => {
    if (get().course !== args.course) {
      CourseRest(args.course).then(() => set(() => ({ course: args.course })));
    }
  },
  isAdmin: false,
  interactions: { ratings: [], time: -1 },
  getInteractions: () => {
    GetInteractions(get).then((ints) => {
      const isAdmin =
        ints.ratings.length > 0 &&
        ints.time !== null &&
        !Number.isNaN(ints.time) &&
        Number.isFinite(ints.time);
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
  setResponse: (res: Response | null) => {
    set(() => ({ response: res }));
    setTimeout(() => set(() => ({ response: null })), 10000); // timeout after 10 seconds
  },
  sendEmail: (
    studentCSE: string | null,
    course: string | null = null,
    multiples = false
  ) => {
    if (studentCSE === null) {
      get().setResponse({
        class: 'danger',
        content: 'Must set a username',
      });
      return;
    }

    const { setResponse } = api.getState();
    ServiceInterface.sendEmail(studentCSE, course)
      .then((response) => {
        if (response === '0' || response === 0) {
          setResponse({
            class: 'success',
            content: `Interaction${multiples ? 's' : ''} recorded`,
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
