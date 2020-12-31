/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';
import ServiceInterface from 'statics/ServiceInterface';

const SendEmail = (
  studentID: number,
  course: string | null = null,
  multiples = false,
  interactionType: string | null = null
) => {
  const { setResponse } = api.getState();
  if (studentID === null) {
    setResponse({
      class: 'danger',
      content: 'Must set a username',
    });
    return;
  }

  ServiceInterface.sendEmail(studentID, course, interactionType)
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

export default SendEmail;
