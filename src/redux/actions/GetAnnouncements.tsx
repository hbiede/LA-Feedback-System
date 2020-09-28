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

const getAnnouncements = async (
  state: GetState<AppReduxState>
): Promise<ResponseMessage> => {
  const { setResponse } = state();

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let responseObj: ResponseMessage = {
    class: 'info',
    content: '',
  };
  await fetch(`${ServiceInterface.getPath()}/announcements.php`, requestOptions)
    .then((response: Response) => response.json())
    .then((json) => {
      if (json.body) {
        responseObj = {
          class: (json.class as ResponseMessage['class']) ?? 'info',
          content: <ReactMarkdown source={json.body as string} />,
        };
      }
    })
    .catch((error) => setResponse(error));
  return responseObj;
};

export default getAnnouncements;
