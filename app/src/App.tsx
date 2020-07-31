/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import FeedbackForm from './screens/FeedbackForm';
import AdminTable from './screens/AdminTable';

import ServiceInterface from './statics/ServiceInterface';
import NavBar from './components/NavBar';

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAsLA, setAdminAsLA] = useState(false);
  const [course, setCourse] = useState<string | null>(null);

  const newUsername = useCallback((newUser: string) => {
    if (newUser !== null && newUser.trim().length > 0) {
      if (newUser.includes('INVALID_TICKET_KEY')) {
        ServiceInterface.login();
      } else {
        const trimmedName = newUser.trim();
        setUsername(trimmedName);
        ServiceInterface.isAdmin(trimmedName).then((adminState) => {
          setIsAdmin(adminState);
        });
        if (trimmedName !== null) {
          ServiceInterface.nameREST(trimmedName).then((newName: string) => {
            setName(newName);
          });
        }
      }
    }
  }, [setUsername, setName, setIsAdmin]);

  const setNewName = useCallback((newName: string) => {
    if (newName !== name && username !== null) {
      setName(newName);
      // noinspection JSIgnoredPromiseFromCall
      ServiceInterface.nameREST(username, newName);
    }
  }, [username, name, setName]);

  const toggleAdminAsLA = useCallback(() => setAdminAsLA(!adminAsLA), [setAdminAsLA, adminAsLA]);

  useEffect(() => {
    ServiceInterface.getUsername().then((newUser) => {
      newUsername(newUser);
      ServiceInterface.courseREST(newUser).then((c) => {
        setCourse(c);
      });
    });
    // No Deps == componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const responseDivRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="App">
      {username === null
        ? (
          <main role="main">
            <div className="jumbotron">
              <div className="container">
                <h4 style={{ marginLeft: 0, marginTop: 45 }}>
                  Loading
                </h4>
              </div>
            </div>
          </main>
        )
        : (
          <>
            <NavBar
              adminAsLA={adminAsLA}
              isAdmin={isAdmin}
              name={name}
              toggleAdminAsLA={toggleAdminAsLA}
              setName={setNewName}
              username={username}
            />
            <main role="main">
              <div className="jumbotron">
                {isAdmin && !adminAsLA
                  ? (
                    <div className="container">
                      <h4 style={{ marginLeft: 0, marginTop: 45 }}>
                        LA Feedback Admin Interface
                      </h4>
                      <AdminTable style={{ marginTop: '25px' }} username={username} />
                    </div>
                  )
                  : (
                    <div className="container">
                      <h4 style={{ marginLeft: 0, marginTop: 45 }}>LA Feedback Interface</h4>
                      <p style={{ marginLeft: 0 }}>
                        This web interface allows LAs to receive anonymous feedback on
                        their performance from students. Select the course you worked with and enter
                        the Student&apos;s CSE username
                      </p>

                      <div id="responseDiv" ref={responseDivRef} />

                      <div className="col-md-6">
                        <FeedbackForm
                          defaultCourse={course}
                          isAdmin={isAdmin}
                          name={name}
                          responseDivRef={responseDivRef}
                          username={username}
                        />
                      </div>
                    </div>
                  )}
              </div>
            </main>
          </>
        )}
    </div>

  );
}

export default App;
