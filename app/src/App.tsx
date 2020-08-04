/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useEffect, useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Collapse from 'react-bootstrap/Collapse';
import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';

import shallow from 'zustand/shallow';

import Redux, { api } from 'redux/modules';

import AdminTable from 'screens/AdminTable';

import FeedbackForm from 'screens/FeedbackForm';

import NavBar from 'components/NavBar';
import FeedbackHeader from 'components/FeedbackHeader';

function App() {
  const { loading, isAdmin, response, setResponse } = Redux(
    (state) => ({
      loading: state.loading,
      isAdmin: state.isAdmin,
      response: state.response,
      setResponse: state.setResponse,
    }),
    shallow
  );
  const [adminAsLA, setAdminAsLA] = useState(false);

  const toggleAdminAsLA = useCallback(() => setAdminAsLA(!adminAsLA), [
    setAdminAsLA,
    adminAsLA,
  ]);

  useEffect(() => {
    api.getState().getUsername();
    // No Deps == componentDidMount
  }, []);

  return (
    <div className="App">
      {loading ? (
        <main role="main">
          <Jumbotron fluid>
            <Container>
              <h4 style={{ marginLeft: 0, marginTop: 45 }}>Loading</h4>
            </Container>
          </Jumbotron>
        </main>
      ) : (
        <>
          <NavBar adminAsLA={adminAsLA} toggleAdminAsLA={toggleAdminAsLA} />
          <main role="main">
            <Jumbotron>
              <Container>
                {isAdmin && !adminAsLA ? (
                  <>
                    <h4 style={{ marginLeft: 0, marginTop: 45 }}>
                      LA Feedback Admin Interface
                    </h4>
                    <Collapse in={response !== null}>
                      <Alert
                        variant={response?.class}
                        id="responseDiv"
                        onClose={() => setResponse(null)}
                        dismissible={response !== null}
                      >
                        {response?.content}
                      </Alert>
                    </Collapse>
                    <AdminTable style={{ marginTop: '25px' }} />
                  </>
                ) : (
                  <>
                    <FeedbackHeader />
                    <Collapse in={response !== null}>
                      <Alert
                        variant={response?.class}
                        id="responseDiv"
                        onClose={() => setResponse(null)}
                        dismissible={response !== null}
                      >
                        {response?.content}
                      </Alert>
                    </Collapse>
                    <FeedbackForm />
                  </>
                )}
              </Container>
            </Jumbotron>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
