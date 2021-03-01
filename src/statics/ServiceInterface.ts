/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { api } from 'redux/modules';

import { RESTResponse } from 'statics/Types';

const CSE_CAS_SERVICE = 'https://shib.unl.edu/idp/profile/cas';

class ServiceInterface {
  /**
   * Logs an interaction with a given student
   *
   * @param studentID The database ID of the student being logged
   * @param course The course for which the student had an interaction
   * @param interactionType The type of interaction (i.e., 'office hour', 'lab')
   */
  static logInteraction = async (
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

  /**
   * Gets the current URL without the query params
   */
  static getPath = () => window.location.href.split('?')[0].replace(/\/$/, '');

  /**
   * Redirects to the CAS login page
   */
  static login = () => {
    window.location.href = `${CSE_CAS_SERVICE}/login?service=${ServiceInterface.getPath()}`;
  };

  /**
   * Redirects to the CAS logout page
   */
  static logout = () => {
    window.location.href = `${CSE_CAS_SERVICE}/logout?service=${ServiceInterface.getPath()}`;
  };

  /**
   * Used to modify data about the currently selected user
   *
   * @param service The REST api URL
   * @param username The currently selected user's username
   * @param updateVal The new value
   * @return RESTResponse
   * @see RESTResponse
   */
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

  static getAccountHost = () => {
    const match = /~(<account>.+?)\//i.exec(ServiceInterface.getPath());
    return match ? match[1] : null;
  };
}

export default ServiceInterface;
