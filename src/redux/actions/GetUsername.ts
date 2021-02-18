/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { SetState } from 'zustand';

import { api, AppReduxState } from 'redux/modules';

import ServiceInterface from 'statics/ServiceInterface';

/**
 * Get the CSE username of of an individual based on the ticket received from the CAS
 *
 * @param set The redux setter
 */
const getUsername = async (set: SetState<AppReduxState>): Promise<void> => {
  if (window.location.host === 'localhost') {
    set(() => ({ username: 'dev' }));
    return;
  }

  const ticketService = `${ServiceInterface.getPath()}/ticketAccessor.php`;
  const ticket = new URLSearchParams(window.location.search).get('ticket');
  if (ticket === null) {
    ServiceInterface.login();
  }
  const requestConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticket, service: ServiceInterface.getPath() }),
  };
  await fetch(ticketService, requestConfig)
    .then((response: Response) => response.text())
    .then((text: string) => {
      if (text && text.includes('INVALID_TICKET_KEY')) {
        ServiceInterface.login();
      } else {
        set(() => ({ username: text }));
      }
    })
    .catch((error) => {
      api.getState().setResponse({ class: 'danger', content: error });
    });
};

export default getUsername;
