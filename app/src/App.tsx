/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Transition } from 'react-transition-group';
import shallow from 'zustand/shallow';

import FeedbackForm from 'screens/FeedbackForm';
import AdminTable from 'screens/AdminTable';

import NavBar from 'components/NavBar';

import Redux, { api } from 'redux/modules';

const TRANSITION_TIME = 300;
const DEFAULT_STYLES = {
  transition: `opacity ${TRANSITION_TIME}ms ease-in-out`,
  opacity: 0,
};

const TRANSITION_STYLE = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
  unmounted: { opacity: 0 },
};

function App() {
  const { loading, isAdmin, response } = Redux(
    (state) => ({
      loading: state.loading,
      isAdmin: state.isAdmin,
      response: state.response,
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

  const hasResponse =
    (response && response.content.trim().length !== 0) ?? false;

  return (
    <div className="App">
      <Transition in={hasResponse} timeout={TRANSITION_TIME}>
        {(state) => (
          <div
            className={['alert', `alert-${response?.class}`].join(' ')}
            id="responseDiv"
            style={{
              ...DEFAULT_STYLES,
              ...TRANSITION_STYLE[state],
            }}
          >
            {response?.content}
          </div>
        )}
      </Transition>

      {loading ? (
        <main role="main">
          <div className="jumbotron">
            <div className="container">
              <h4 style={{ marginLeft: 0, marginTop: 45 }}>Loading</h4>
            </div>
          </div>
        </main>
      ) : (
        <>
          <NavBar adminAsLA={adminAsLA} toggleAdminAsLA={toggleAdminAsLA} />
          <main role="main">
            <div className="jumbotron">
              {isAdmin && !adminAsLA ? (
                <div className="container">
                  <h4 style={{ marginLeft: 0, marginTop: 45 }}>
                    LA Feedback Admin Interface
                  </h4>
                  <AdminTable style={{ marginTop: '25px' }} />
                </div>
              ) : (
                <div className="container">
                  <FeedbackForm />
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
