/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React from 'react';
import { GetState } from 'zustand';
import ReactMarkdown from 'react-markdown';

import ServiceInterface from 'statics/ServiceInterface';

import { AppReduxState } from 'redux/modules';

import { ResponseMessage } from '../modules/Types';

/**
 * Gets the current announcements. If more than one announcement exists,
 * the most specific course announcement will be received.
 *
 * @param state The redux state
 */
const getAnnouncements = async (
  state: GetState<AppReduxState>
): Promise<ResponseMessage> => {
  const { course, setResponse } = state();

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ course }),
  };

  let responseObj: ResponseMessage = {
    class: 'info',
    content: '',
  };
  await fetch(`${ServiceInterface.getPath()}/announcements.php`, requestOptions)
    .then((response: Response) => response.json())
    .then((json) => {
      if (json.body && json.body.toString().trim().length > 0) {
        responseObj = {
          class: (json.class as ResponseMessage['class']) ?? 'info',
          content: <ReactMarkdown source={json.body.toString().trim()} />,
        };
      }
    })
    .catch((error) => setResponse({ class: 'danger', content: error }));
  return responseObj;
};

export default getAnnouncements;
