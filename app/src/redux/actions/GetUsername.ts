/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import { SetState } from 'zustand';

import { api, AppReduxState } from 'redux/modules';

import ServiceInterface from 'statics/ServiceInterface';

const getUsername = async (set: SetState<AppReduxState>): Promise<void> => {
  const ticketService =
    'https://cse.unl.edu/~learningassistants/LA-Feedback/ticketAccessor.php';
  const ticket = new URLSearchParams(window.location.search).get('ticket');
  if (ticket === null) {
    ServiceInterface.login();
  }
  const requestConfig = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket }),
  };
  await fetch(ticketService, requestConfig)
    .then((response) => response.text())
    .then((text) => {
      if (text && text.includes('INVALID_TICKET_KEY')) {
        ServiceInterface.login();
      } else {
        set(() => ({ username: text }));
      }
    })
    .catch((error) => {
      api.getState().setResponse(error);
    });
};

export default getUsername;
