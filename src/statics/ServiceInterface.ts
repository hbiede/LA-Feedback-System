/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';

import { RESTResponse } from 'statics/Types';

const CSE_CAS_SERVICE = 'https://cse-apps.unl.edu/cas';

class ServiceInterface {
  static sendEmail = async (
    studentID: number,
    course: string | null = null,
    interactionType: string | null = null
  ): Promise<string | number | null> => {
    const { course: defaultCourse, setResponse } = api.getState();
    const laCSE = ServiceInterface.getActiveUser();
    if (laCSE !== null && laCSE.trim().length > 0 && laCSE !== 'INVALID') {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentID,
          laCSE,
          course:
            course === null || course.trim().length === 0
              ? defaultCourse
              : course,
          interactionType,
        }),
      };
      let status = null;
      await fetch(`${ServiceInterface.getPath()}/sendEmail.php`, requestOptions)
        .then((response) => response.json())
        .then((body) => {
          status = body.message;
        });
      return status;
    }
    setResponse({
      class: 'danger',
      content: 'Must set a username',
    });

    return null;
  };

  static getPath = () => window.location.href.split('?')[0].replace(/\/$/, '');

  static login = () => {
    window.location.href = `${CSE_CAS_SERVICE}/login?service=${ServiceInterface.getPath()}`;
  };

  static logout = () => {
    window.location.href = `${CSE_CAS_SERVICE}/logout?service=${ServiceInterface.getPath()}`;
  };

  static rest = async (
    service: string,
    username: string,
    updateVal: string | null = null
  ): Promise<RESTResponse> => {
    let returnVal: RESTResponse = {
      name: '',
      course: '',
    };
    const requestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, updateVal }),
    };
    await fetch(service, requestConfig)
      .then((response) => response.json())
      .then((body: RESTResponse) => {
        if (body) {
          returnVal = body;
        }
      })
      .catch((error: Error) => {
        if (
          error.message.includes('cancelled') ||
          (updateVal === null && error.message.includes('match'))
        ) {
          return;
        }
        api.getState().setResponse({
          class: 'danger',
          content: error.message,
        });
      });
    return returnVal;
  };

  static getActiveUser = (): string => {
    const { username, isAdmin, selectedUsername } = api.getState();
    return isAdmin ? selectedUsername : username;
  };
}

export default ServiceInterface;
