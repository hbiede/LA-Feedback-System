import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import FeedbackForm from './FeedbackForm';
import AdminTable from './AdminTable';

import Services from '../services/backgroundService';

function App() {
  const [username, setUsername] = useState<string|null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const newUsername = useCallback((newUser: string) => {
    if (newUser !== null && newUser.trim().length > 0) {
      if (newUser.includes('INVALID_TICKET_KEY')) {
        Services.login();
      } else {
        setUsername(newUser);
        Services.isAdmin(newUser).then((adminState) => setIsAdmin(adminState));
      }
    }
  }, [setUsername]);

  useEffect(() => {
    Services.getUsername().then((newUser) => {
      newUsername(newUser);
    });
    // No Deps == componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const responseDivRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="App">
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <p className="navbar-brand" style={{ marginBottom: 0 }}>
          {`LA Feedback${isAdmin ? ' Admin' : ''}`}
        </p>

        <div className="collapse navbar-collapse" id="navbarsExampleDefault">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item dropdown">
              <button
                aria-expanded="false"
                className="btn btn-dark dropdown-toggle"
                type="button"
                id="dropdown01"
                data-toggle="dropdown"
                aria-haspopup="true"
              >
                Resources
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdown01">
                <a
                  className="dropdown-item"
                  href="https://cse-apps.unl.edu/handin"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  CSE Handin
                </a>
                <a
                  className="dropdown-item"
                  href="https://canvas.unl.edu/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Canvas
                </a>
                <a
                  className="dropdown-item"
                  href="https://cse.unl.edu/faq"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  System FAQ
                </a>
                <a
                  className="dropdown-item"
                  href="https://cse.unl.edu/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Department Home
                </a>
              </div>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-dark"
                type="button"
                onClick={Services.logout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main role="main">
        {username === null
          ? (
            <div className="jumbotron">
              <div className="container">
                <h4 style={{ marginLeft: 0, marginTop: '25px' }}>
                  Loading
                </h4>
              </div>
            </div>
          )
          : (
            <div className="jumbotron">
              {isAdmin
                ? (
                  <div className="container">
                    <h4 style={{ marginLeft: 0, marginTop: '25px' }}>
                      LA Feedback Admin Interface
                    </h4>
                    <AdminTable style={{ marginTop: '25px' }} username={username} />
                  </div>
                )
                : (
                  <div className="container">
                    <h4 style={{ marginLeft: 0, marginTop: '25px' }}>LA Feedback Interface</h4>
                    <p style={{ marginLeft: 0 }}>
                      This web interface allows LAs to receive anonymous feedback on
                      their performance from students. Select the course you worked with and enter
                      the Student&apos;s CSE username
                    </p>

                    <div id="responseDiv" ref={responseDivRef} />

                    <div className="col-md-6">
                      <FeedbackForm responseDivRef={responseDivRef} username={username} />
                    </div>
                  </div>
                )}
            </div>
          )}
      </main>
    </div>
  );
}

export default App;
