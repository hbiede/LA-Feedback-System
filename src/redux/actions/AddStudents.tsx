/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import shallow from 'zustand/shallow';

import ServiceInterface from 'statics/ServiceInterface';

import Redux from 'redux/modules';

export type AddStudentsProps = {
  /**
   * The students text to parse and input
   */
  students: string;
};

/**
 * Adds students to the database
 *
 * @param props The new students
 */
const addStudents = async (props: AddStudentsProps): Promise<number> => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(props),
  };

  let response = 0;

  await fetch(
    `${ServiceInterface.getPath()}/addStudents.php`,
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

export default addStudents;
