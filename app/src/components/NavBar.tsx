/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';
import shallow from 'zustand/shallow';

import packageJson from '../../package.json';
import Redux from '../redux/modules';
import SettingsForm from './SettingsForm';

import changelog from '../CHANGELOG.json';

type Props = {
  adminAsLA: boolean;
  toggleAdminAsLA: () => void;
};

const MODAL_STYLE = {
  overlay: { marginTop: 50, zIndex: 2, },
};

const NavBar = ({ adminAsLA, toggleAdminAsLA } : Props) => {
  const {
    isAdmin,
    logout,
  } = Redux((state) => ({
    isAdmin: state.isAdmin,
    logout: state.logout,
  }), shallow);
  const [showingSettings, setSettingsVisibility] = useState(false);
  const [showingChangelog, setChangelogVisibility] = useState(false);

  const hideSettings = useCallback(() => {
    setSettingsVisibility(false);
  }, [setSettingsVisibility]);

  const toggleSettings = useCallback(() => {
    if (showingSettings) {
      setSettingsVisibility(false);
    } else {
      setChangelogVisibility(false);
      setSettingsVisibility(true);
    }
  }, [showingSettings, setSettingsVisibility, setChangelogVisibility]);

  const hideChangelog = useCallback(() => {
    setChangelogVisibility(false);
  }, [setChangelogVisibility]);

  const toggleChangelog = useCallback(() => {
    if (showingChangelog) {
      setChangelogVisibility(false);
    } else {
      setSettingsVisibility(false);
      setChangelogVisibility(true);
    }
  }, [showingChangelog, setChangelogVisibility, setSettingsVisibility]);

  const switchToAdmin = useCallback(() => {
    toggleAdminAsLA();
    hideSettings();
  }, [toggleAdminAsLA, hideSettings]);

  if (!changelog.changes[0].includes(packageJson.version)) {
    return (
      <Modal
        isOpen
        onRequestClose={() => {}}
        contentLabel="Changelog"
        style={{ overlay: { marginTop: 50 } }}
      >
        <div>
          Someone forgot to update the changelog and/or version number
        </div>
      </Modal>
    );
  }

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#laNavBar"
          aria-controls="laNavBar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <p className="navbar-brand" style={{ marginBottom: 0 }}>
          {`LA Feedback${isAdmin ? ' Admin' : ''} `}
          <button type="button" className="btn btn-dark" onClick={toggleChangelog}>
            <small>{`v${packageJson.version}`}</small>
          </button>
        </p>

        <div className="collapse navbar-collapse" id="laNavBar">
          <ul className="navbar-nav mr-auto">
            {isAdmin && (
            <li className="nav-item">
              <button
                className="btn btn-dark"
                type="button"
                onClick={switchToAdmin}
              >
                {adminAsLA ? 'Admin Panel' : 'LA Page'}
              </button>
            </li>
            )}
            {(!isAdmin || adminAsLA)
              && (
                <li className="nav-item">
                  <button
                    className="btn btn-dark"
                    type="button"
                    onClick={toggleSettings}
                  >
                    LA Settings
                  </button>
                </li>
              )}
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
                onClick={logout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
      {(!isAdmin || adminAsLA) && (
      <Modal
        isOpen={showingSettings}
        onRequestClose={hideSettings}
        contentLabel="LA Settings"
        style={MODAL_STYLE}
      >
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
          onClick={hideSettings}
        >
          <span aria-hidden="true">×</span>
        </button>
        <SettingsForm
          closeModal={hideSettings}
        />
      </Modal>
      )}
      <Modal
        isOpen={showingChangelog}
        onRequestClose={hideChangelog}
        contentLabel="Changelog"
        style={MODAL_STYLE}
      >
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
          onClick={hideChangelog}
        >
          <span aria-hidden="true">×</span>
        </button>
        <div>
          {changelog.changes.map((change) => <ReactMarkdown source={change} />)}
        </div>
      </Modal>
    </>
  );
};

export default NavBar;
