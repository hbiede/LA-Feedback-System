/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';
import ServiceInterface from 'statics/ServiceInterface';

/**
 * Logs an interaction with a given student
 *
 * @param studentID The database ID of the student being logged
 * @param course The course for which the student had an interaction
 * @param multiples If the LA logged multiple students at once
 * @param interactionType The type of interaction (i.e., 'office hour', 'lab')
 * @param recommended If the student was recommended by the LA
 */
const LogInteraction = (
  studentID: number,
  course: string | null = null,
  multiples = false,
  interactionType: string | null = null,
  recommended = false
) => {
  const { setResponse, username } = api.getState();
  if (studentID === null) {
    setResponse({
      class: 'danger',
      content: 'Must set a username',
    });
    return;
  }
  if (/^cse\d/.test(username)) {
    setResponse({
      class: 'danger',
      content: 'You may not log interactions as a course',
    });
    return;
  }

  ServiceInterface.logInteraction(
    studentID,
    course,
    interactionType,
    recommended
  )
    .then((response) => {
      if (response === '0' || response === 0) {
        setResponse({
          class: 'success',
          content: `Interaction${multiples ? 's' : ''} recorded`,
        });
      } else if (response === '3' || response === 3) {
        setResponse({
          class: 'danger',
          content:
            'Must wait at least 30 seconds between interactions with the same person',
        });
      } else {
        setResponse({
          class: 'danger',
          content: `Failed to Send Message. Please Try Again. (Error Code ${response})`,
        });
      }
    })
    .catch((error) => {
      setResponse({
        class: 'danger',
        content: `Failed to Send Message. Please Try Again. (Error: ${error})`,
      });
    });
};

export default LogInteraction;
