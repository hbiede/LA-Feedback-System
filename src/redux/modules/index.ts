/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import create from 'zustand';

import SendEmail from 'redux/actions/SendEmail';

import {
  ClearAnnouncements,
  CourseRest,
  GetAnnouncements,
  GetCounts,
  GetInteractionBreakdowns,
  GetInteractionTimes,
  GetInteractions,
  GetRatings,
  GetStudents,
  GetUsername,
  NameRest,
  SetAnnouncements,
} from 'redux/actions';

import {
  CourseCount,
  InteractionBreakdown,
  InteractionTime,
  ResponseMessage,
  SetCourseArgs,
  SetNameArgs,
  SetSelectedUsernameArgs,
  Student,
} from 'redux/modules/Types';

import ServiceInterface from 'statics/ServiceInterface';
import { InteractionSummary, RatingRecord } from 'statics/Types';

import { AnnouncementProps } from '../actions/SetAnnouncements';

export type AppReduxState = {
  clearAnnouncements: () => Promise<void>;
  course: string;
  getAnnouncements: () => void;
  getCounts: () => Promise<CourseCount[]>;
  getCourse: () => void;
  getInteractionBreakdowns: () => Promise<InteractionBreakdown[]>;
  getInteractions: () => void;
  getName: () => void;
  getRatings: () => void;
  getStudents: () => void;
  getTimes: () => Promise<InteractionTime[]>;
  incrementSessionInteractions: (student: string) => void;
  interactions: InteractionSummary;
  isAdmin: boolean;
  loading: boolean;
  logout: () => void;
  name: string;
  ratings: RatingRecord[];
  response: ResponseMessage | null;
  selectedUsername: string;
  sendEmail: (
    studentID: number,
    course?: string | null,
    multiples?: boolean,
    interactionType?: string | null
  ) => void;
  sessionInteractions: Record<string, number>;
  setAnnouncements: (props: AnnouncementProps) => Promise<number>;
  setCourse: (args: SetCourseArgs) => void;
  setInteractions: (ints: InteractionSummary) => void;
  setName: (args: SetNameArgs) => void;
  setResponse: (res: ResponseMessage | null) => void;
  setSelectedUsername: (args: SetSelectedUsernameArgs) => void;
  startUp: () => void;
  students: Student[];
  username: string;
};

export const [useStore, api] = create<AppReduxState>((set, get) => ({
  loading: true,
  username: '',
  startUp: () => {
    GetUsername(set).then(() => {
      get().getName();
      get().getCourse();
      get().getInteractions();
      get().getAnnouncements();
      get().getStudents();
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
  interactions: {
    isAdmin: false,
    outstanding: 0,
    ratings: [],
    sentiment: -1,
    time: -1,
  },
  sessionInteractions: {},
  incrementSessionInteractions: (student: string) =>
    set(() => ({
      sessionInteractions: { ...get().sessionInteractions, [student]: true },
    })),
  getInteractions: () => {
    GetInteractions(get).then((ints) => {
      const { isAdmin } = ints;
      const { name, course } = get();
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
    set(() => ({ selectedUsername: args.username, ratings: [] }));
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
  setResponse: (res: ResponseMessage | null) => {
    set(() => ({ response: res }));
    setTimeout(() => set(() => ({ response: null })), 10000); // timeout after 10 seconds
  },
  sendEmail: SendEmail,
  logout: () => ServiceInterface.logout(),
  getTimes: GetInteractionTimes,
  getCounts: GetCounts,
  getInteractionBreakdowns: GetInteractionBreakdowns,
  getAnnouncements: () => {
    GetAnnouncements(get).then((responseBody) => {
      if (
        (responseBody.content as string).length > 0 ||
        (responseBody.content as JSX.Element)
      ) {
        set(() => ({ response: responseBody }));
      }
    });
  },
  setAnnouncements: SetAnnouncements,
  clearAnnouncements: ClearAnnouncements,
  students: [],
  getStudents: () => {
    GetStudents().then((result) => {
      set(() => ({ students: result }));
    });
  },
}));

export default useStore;
