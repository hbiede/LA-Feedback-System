/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { useCallback, useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Collapse from 'react-bootstrap/Collapse';
import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Spinner from 'react-bootstrap/Spinner';

import shallow from 'zustand/shallow';

import Redux from 'redux/modules';

import FeedbackForm from 'screens/FeedbackForm';

import NavBar from 'components/NavBar';
import FeedbackHeader from 'components/FeedbackHeader';

import styles from './App.styles';

function App() {
  const {
    loading,
    isAdmin,
    response,
    setResponse,
    setSelectedUsername,
  } = Redux(
    (state) => ({
      loading: state.loading,
      isAdmin: state.isAdmin,
      response: state.response,
      setResponse: state.setResponse,
      setSelectedUsername: state.setSelectedUsername,
    }),
    shallow
  );
  const [adminAsLA, setAdminAsLA] = useState(false);

  const toggleAdminAsLA = useCallback(() => {
    setSelectedUsername({ username: '' });
    setAdminAsLA(!adminAsLA);
  }, [setAdminAsLA, adminAsLA]);

  const AdminScreen = React.lazy(() => import('screens/AdminScreen'));
  const loadingLabel = <h4 style={styles.loadingSpinner}>Loading</h4>;

  return (
    <div className="App">
      {loading ? (
        <main role="main">
          <Jumbotron fluid>
            <Container style={styles.loadingContainer}>
              <Spinner animation="border" variant="primary" />
              {loadingLabel}
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
                    <h4 style={styles.appHeading}>
                      LA Feedback Admin Interface
                    </h4>
                    <Collapse
                      in={
                        response !== null &&
                        response.content !== null &&
                        (typeof response.content !== 'string' ||
                          response.content.trim() !== '')
                      }
                    >
                      <Alert
                        variant={response?.class}
                        id="responseDiv"
                        onClose={() => setResponse(null)}
                        dismissible={
                          response !== null && response.dismissable !== false
                        }
                        hidden={
                          response === null ||
                          response.content === null ||
                          !(
                            typeof response.content !== 'string' ||
                            response.content.trim() !== ''
                          )
                        }
                      >
                        {response?.content}
                      </Alert>
                    </Collapse>
                    <React.Suspense fallback={loadingLabel}>
                      <AdminScreen style={styles.tableContainer} />
                    </React.Suspense>
                  </>
                ) : (
                  <>
                    <FeedbackHeader style={styles.appHeading} />
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
                    <FeedbackForm style={styles.tableContainer} />
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
