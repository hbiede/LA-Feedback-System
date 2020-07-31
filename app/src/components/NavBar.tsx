/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';

import packageJson from '../../package.json';
import ServiceInterface from '../statics/ServiceInterface';
import SettingsForm from './SettingsForm';

import changelog from '../CHANGELOG.json';

type Props = {
  adminAsLA: boolean;
  isAdmin: boolean;
  name: string|null;
  toggleAdminAsLA: () => void;
  setName: (newName: string) => void;
  username: string;
};

const NavBar = ({
  adminAsLA,
  isAdmin,
  name,
  toggleAdminAsLA,
  setName,
  username,
} : Props) => {
  const [showingModal, setModalVisibility] = useState(false);
  const [showingChangelog, setChangelogVisibility] = useState(false);

  const showModal = useCallback(() => {
    setModalVisibility(true);
  }, [setModalVisibility]);

  const hideModal = useCallback(() => {
    setModalVisibility(false);
  }, [setModalVisibility]);

  const showChangelog = useCallback(() => {
    setChangelogVisibility(true);
  }, [setChangelogVisibility]);

  const hideChangelog = useCallback(() => {
    setChangelogVisibility(false);
  }, [setChangelogVisibility]);

  const switchToAdmin = useCallback(() => {
    toggleAdminAsLA();
    hideModal();
  }, [toggleAdminAsLA, hideModal]);

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
          <button className="btn btn-dark" onClick={showChangelog}>
          <small>{`v${packageJson.version}`}</small>
          </button>
        </p>

        <div className="collapse navbar-collapse" id="laNavBar">
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
                    onClick={showingModal ? hideModal : showModal}
                  >
                    LA Settings
                  </button>
                </li>
              )}
            <li className="nav-item">
              <button
                className="btn btn-dark"
                type="button"
                onClick={ServiceInterface.logout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
      {(!isAdmin || adminAsLA) && (
      <Modal
        isOpen={showingModal}
        onRequestClose={hideModal}
        contentLabel="LA Settings"
        style={{ overlay: { marginTop: 50 } }}
      >
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
          onClick={hideModal}
        >
          <span aria-hidden="true">×</span>
        </button>
        <SettingsForm
          closeModal={hideModal}
          isAdmin={isAdmin}
          name={name}
          setName={setName}
          username={username}
        />
      </Modal>
      )}
      <Modal
        isOpen={showingChangelog}
        onRequestClose={hideChangelog}
        contentLabel="Changelog"
        style={{ overlay: { marginTop: 50 } }}
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
