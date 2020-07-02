import React, { useRef } from 'react';

import './App.css';
import FeedbackForm from './components/FeedbackForm';

function App() {
  const responseDivRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="App">
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <p className="navbar-brand" style={{ marginBottom: 0 }}>
          LA Feedback
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
          </ul>
        </div>
      </nav>

      <main role="main">
        <div className="jumbotron">
          <div className="container">
            <h4 style={{ marginLeft: 0 }}>LA Feedback Interface</h4>
            <p style={{ marginLeft: 0 }}>
              This web interface allows LAs to receive anonymous feedback on
              their performance from students.
            </p>

            <div id="responseDiv" ref={responseDivRef} />

            <div className="col-md-6">
              <FeedbackForm responseDivRef={responseDivRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
