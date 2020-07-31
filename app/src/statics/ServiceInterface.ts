/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

/* eslint-disable no-console */
import {
  InteractionSummary,
  RatingRecord,
  RatingResponse,
  RESTResponse,
} from './Types';

class ServiceInterface {
  static username = '';

  static interactions: InteractionSummary = { ratings: [], time: -1 };

  static sendEmail = async (studentCSE: string, laCSE: string, course: string):
      Promise<string | number | null> => {
    if (laCSE !== null && laCSE !== 'INVALID') {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentCSE, laCSE, course }),
      };
      let status = null;
      await fetch(`${process.env.PUBLIC_URL}/sendEmail.php`, requestOptions)
        .then((response) => response.json())
        .then((body) => {
          status = body.message;
        });
      return status;
    }
    return null;
  }

  static getPath = () => window.location.href.split('?')[0];

  static login = () => {
    const casService = 'https://cse-apps.unl.edu/cas';
    window.location.href = `${casService}/login?service=${ServiceInterface.getPath()}`;
  }

  static logout = () => {
    const casService = 'https://cse-apps.unl.edu/cas';
    window.location.href = `${casService}/logout?service=${ServiceInterface.getPath()}`;
  }

  static getUsername = async (): Promise<string> => {
    if (ServiceInterface.username && ServiceInterface.username !== '') {
      return ServiceInterface.username;
    }

    const ticketService = 'https://cse.unl.edu/~learningassistants/LA-Feedback/ticketAccessor.php';
    const ticket = new URLSearchParams(window.location.search).get('ticket');
    if (ticket === null) {
      ServiceInterface.login();
    }
    let username = '';
    const requestConfig = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket }),
    };
    await fetch(ticketService, requestConfig).then((response) => response.text())
      .then((text) => {
        if (username && username.includes('INVALID_TICKET_KEY')) {
          ServiceInterface.login();
        } else {
          ServiceInterface.username = text;
          username = text;
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return username;
  }

  static rest = async (service: string, username: string, updateVal: string|null = null):
      Promise<RESTResponse> => {
    let returnVal: RESTResponse = { name: '', course: '' };
    const requestConfig = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, updateVal }),
    };
    await fetch(service, requestConfig).then((response) => response.json())
      .then((body: RESTResponse) => {
        if (body && body) {
          returnVal = body;
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return returnVal;
  }

  static nameREST = async (
    username: string,
    name: string|null = null): Promise<string> => ServiceInterface.rest(
    'https://cse.unl.edu/~learningassistants/LA-Feedback/name.php',
    username,
    name,
  ).then((json) => (json.name ? json.name : ''));

  static getInteractions = async (username: string): Promise<InteractionSummary> => {
    if (username !== 'INVALID_TICKET_KEY'
      && ServiceInterface.interactions !== null
      && ServiceInterface.interactions !== undefined) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username }),
      };
      await fetch('https://cse.unl.edu/~learningassistants/LA-Feedback/admin.php',
        requestOptions)
        .then((response) => response.json())
        .then((json) => {
          if (Array.isArray(json)) {
            ServiceInterface.interactions = {
              ratings: json,
              time: -1,
            };
          } else {
            ServiceInterface.interactions = json;
            if (ServiceInterface.interactions.time === null) {
              ServiceInterface.interactions.time = 0;
            }
          }
        }).catch((error) => console.error(error));
    }
    return ServiceInterface.interactions;
  }

  static getRatings = async (username: string, la: string): Promise<RatingRecord[]> => {
    let ratings: RatingRecord[] = [];
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username, la }),
    };
    await fetch('https://cse.unl.edu/~learningassistants/LA-Feedback/admin.php',
      requestOptions)
      .then((response) => response.json())
      .then((json) => {
        const ratingsResponse: RatingResponse[] = json;
        ratings = ratingsResponse.map((rating) => ({
          ...rating,
          time: new Date(Date.parse(rating.time.replace(new RegExp(String.raw`\s`), 'T'))),
        }));
      }).catch((error) => console.error(error));
    return ratings;
  }

  static isAdmin = async (username: string):
      Promise<boolean> => {
    const interactions = (await ServiceInterface.getInteractions(username));
    return interactions.ratings.length > 0
        || (interactions.time !== null
            && !Number.isNaN(interactions.time)
            && Number.isFinite(interactions.time));
  };

  static courseREST = async (
    username: string,
    course: string|null = null): Promise<string> => ServiceInterface.rest(
    'https://cse.unl.edu/~learningassistants/LA-Feedback/course.php',
    username,
    course,
  ).then((json) => (json.course ? json.course : ''));
}

export default ServiceInterface;
