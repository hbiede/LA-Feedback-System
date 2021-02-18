/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';
import { Student } from 'redux/modules/Types';
import ServiceInterface from 'statics/ServiceInterface';

/**
 * Get a list of `Student`s
 *
 * @return all students in the database
 */
const getStudents = async (): Promise<Student[]> => {
  let students: Student[] = [];

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  await fetch(`${ServiceInterface.getPath()}/getStudents.php`, requestOptions)
    .then((response: Response) => response.json())
    .then(({ students: studentResponse }: { students: Student[] }) => {
      students = studentResponse;
      if (studentResponse.length === 0) {
        api.getState().setResponse({
          class: 'danger',
          content: 'No students registered for any courses',
        });
      }
    })
    .catch((error) =>
      api.getState().setResponse({ class: 'danger', content: error })
    );
  return students;
};

export default getStudents;
