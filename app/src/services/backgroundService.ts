import { InteractionSummary, RatingRecord } from '../types';

class Services {
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
    window.location.href = `${casService}/login?service=${Services.getPath()}`;
  }

  static logout = () => {
    const casService = 'https://cse-apps.unl.edu/cas';
    window.location.href = `${casService}/logout?service=${Services.getPath()}`;
  }

  static getUsername = async (): Promise<string> => {
    if (Services.username && Services.username !== '') {
      return Services.username;
    }

    const ticketService = 'https://cse.unl.edu/~learningassistants/LA-Feedback/ticketAccessor.php';
    const ticket = new URLSearchParams(window.location.search).get('ticket');
    if (ticket === null) {
      Services.login();
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
          Services.login();
        } else {
          Services.username = text;
          username = text;
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return username;
  }

  static getInteractions = async (username: string): Promise<InteractionSummary> => {
    if (Services.interactions !== null && Services.interactions !== undefined) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username }),
      };
      await fetch('https://cse.unl.edu/~learningassistants/LA-Feedback/admin.php',
        requestOptions)
        .then((response) => response.json())
        .then((json) => {
          Services.interactions = json;
        }).catch((error) => console.error(error));
    }
    return Services.interactions;
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
        console.log(json);
        ratings = json;
      }).catch((error) => console.error(error));
    return ratings;
  }

  static isAdmin = async (username: string):
      Promise<boolean> => (await Services.getInteractions(username)).ratings.length > 0;
}

export default Services;
