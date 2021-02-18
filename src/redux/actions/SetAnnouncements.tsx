/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import shallow from 'zustand/shallow';

import ServiceInterface from 'statics/ServiceInterface';

import Redux from 'redux/modules';

import { ResponseClass } from '../modules/Types';

export type AnnouncementProps = {
  /**
   * The body of the announcement
   */
  body: string;
  /**
   * The way the announcement should be displayed
   */
  class: ResponseClass;
  /**
   * What course for which the announcement will be displayed
   * ('all' will display for all LAs)
   */
  course: string;
};

/**
 * Sets the announcement for a given course
 *
 * @param props The body, class, and course of the announcement
 */
const setAnnouncements = async (props: AnnouncementProps): Promise<number> => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(props),
  };

  let response = 0;

  await fetch(
    `${ServiceInterface.getPath()}/announcements.php`,
    requestOptions
  ).catch((error) => {
    const { setResponse } = Redux(
      (state) => ({
        setResponse: state.setResponse,
      }),
      shallow
    );
    setResponse({ class: 'danger', content: error });
    response = 1;
  });
  return response;
};

export default setAnnouncements;
