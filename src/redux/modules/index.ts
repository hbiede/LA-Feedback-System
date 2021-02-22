/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import create from 'zustand';

import {
  ClearAnnouncements,
  CourseRest,
  GetAnnouncements,
  GetCounts,
  GetCourses,
  GetInteractionBreakdowns,
  GetInteractions,
  GetRatings,
  GetStudents,
  GetUsername,
  LogInteraction,
  NameRest,
  SetAnnouncements,
} from 'redux/actions';

import {
  CourseCount,
  InteractionBreakdown,
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
  /**
   * Eliminates all current announcements
   */
  clearAnnouncements: () => Promise<void>;
  /**
   * The current course for the currently selected user
   */
  course: string;
  /**
   * All courses in the program
   */
  courses: string[];
  /**
   * Gets the current announcements. If more than one announcement exists,
   * the most specific course announcement will be received.
   */
  getAnnouncements: () => void;
  /**
   * Gets the number of interactions per course in the last 7 days
   *
   * @see CourseCount
   */
  getCounts: () => Promise<CourseCount[]>;
  /**
   * Gets the current course for the selected LA
   */
  getCourse: () => void;
  /**
   * Get the number of interactions (both total and weekly) per LA.
   * Used on the Stats page
   *
   * @see InteractionBreakdown
   */
  getInteractionBreakdowns: () => Promise<InteractionBreakdown[]>;
  /**
   * Collects all data for the Admin page
   */
  getInteractions: () => void;
  /**
   * Gets the current name for the selected LA
   */
  getName: () => void;
  /**
   * Get all ratings in the data base for the currently selected LA
   */
  getRatings: () => void;
  /**
   * Get a list of `Student`s
   */
  getStudents: () => void;
  /**
   * Adds the given student to the set of students with whom the LA interacted this session if
   * they are new, and increments the number of interactions they've had
   *
   * @param student The (potentially) newly interacted student
   */
  incrementSessionInteractions: (student: string) => void;
  /**
   * The interactions received from the backend
   *
   * @see InteractionSummary
   */
  interactions: InteractionSummary;
  /**
   * The state of if the current user is an admin
   */
  isAdmin: boolean;
  /**
   * The state of if the backend data is still loading
   */
  loading: boolean;
  /**
   * Logs an interaction with a given student
   *
   * @param studentID The database ID of the student being logged
   * @param course The course for which the student had an interaction
   * @param multiples If the LA logged multiple students at onces
   * @param interactionType The type of interaction (i.e., 'office hour', 'lab')
   */
  logInteraction: (
    studentID: number,
    course?: string | null,
    multiples?: boolean,
    interactionType?: string | null
  ) => void;
  /**
   * Logs the current user out
   */
  logout: () => void;
  /**
   * The name of the currently selected user
   */
  name: string;
  /**
   * All the ratings in the database
   *
   * @see RatingRecord
   */
  ratings: RatingRecord[];
  /**
   * A message to be displayed above the main page
   *
   * @see ResponseMessage
   */
  response: ResponseMessage | null;
  /**
   * The currently selected user
   */
  selectedUsername: string;
  /**
   * The number
   */
  sessionInteractions: Record<string, number>;
  /**
   * Sets the announcement for a given course
   *
   * @see AnnouncementProps
   */
  setAnnouncements: (props: AnnouncementProps) => Promise<number>;
  /**
   * Sets the default course for the currently selected LA
   *
   * @see SetCourseArgs
   */
  setCourse: (args: SetCourseArgs) => void;
  /**
   * Sets the interaction list
   * Note: Currently only used to modifying names and courses for an LA locally
   *
   * @see InteractionSummary
   */
  setInteractions: (ints: InteractionSummary) => void;
  /**
   * Sets the name of the currently selected LA
   *
   * @see SetNameArgs
   */
  setName: (args: SetNameArgs) => void;
  /**
   * Sets the message to be displayed above the main page
   * When given null, the message is cleared.
   *
   * @see ResponseMessage
   */
  setResponse: (res: ResponseMessage | null) => void;
  /**
   * Sets the currently selected LA
   *
   * @see SetSelectedUsernameArgs
   */
  setSelectedUsername: (args: SetSelectedUsernameArgs) => void;
  /**
   * Used to start the app from scratch
   */
  startUp: () => void;
  /**
   * The list of all students in the database
   */
  students: Student[];
  /**
   * The username of a the currently logged in user
   */
  username: string;
};

export const [useStore, api] = create<AppReduxState>((set, get) => ({
  loading: true,
  username: '',
  startUp: () => {
    GetUsername(set).then(() => {
      GetCourses().then((courses) => set({ courses }));
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
  courses: [],
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
      sessionInteractions: {
        ...get().sessionInteractions,
        [student]: (get().sessionInteractions[student] ?? 0) + 1,
      },
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
  logInteraction: LogInteraction,
  logout: () => ServiceInterface.logout(),
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
