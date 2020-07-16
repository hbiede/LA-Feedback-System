import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';
import Services from './services/backgroundService';

const casService = 'https://cse-apps.unl.edu/cas';
const ticketService = 'https://cse.unl.edu/~learningassistants/LA-Feedback/ticketAccessor.php';
const sessionUser = sessionStorage.getItem('cas-user');
const ticket = new URLSearchParams(window.location.search).get('ticket');
let username = '';
if (sessionUser !== null && sessionUser !== 'null' && sessionUser.length > 0) {
  username = sessionUser;
} else if (ticket !== null) {
  const casGet = `${ticketService}/?ticket=${ticket}`
      + `&service=${encodeURIComponent(Services.getPath())}`;
  fetch(casGet, { mode: 'cors' }).then((response) => response.text())
    .then((text) => {
      username = text;
      sessionStorage.setItem('cas-user', text);
      window.location.href = Services.getPath();
    })
    .catch((error) => {
      console.error(error);
    });
} else {
  window.location.href = `${casService}/login?service=${encodeURIComponent(Services.getPath())}`;
}

ReactDOM.render(
  <React.StrictMode>
    <App username={username} />
  </React.StrictMode>,
  document.getElementById('root'),
);
