/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import shallow from 'zustand/shallow';

import ServiceInterface from 'statics/ServiceInterface';

import Redux from 'redux/modules';

export type AddAdminProps = {
  /**
   * The username of the new admin
   */
  username: string;
};

/**
 * Adds a new admin
 *
 * @param props The username
 */
const addAdmin = async (props: AddAdminProps): Promise<number> => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(props),
  };

  let response = 0;

  await fetch(
    `${ServiceInterface.getPath()}/addAdmin.php`,
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

export default addAdmin;
