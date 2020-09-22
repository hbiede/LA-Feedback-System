/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { useCallback, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';

import shallow from 'zustand/shallow';

import BreakdownTable from 'components/BreakdownTable';

import Redux, { AppReduxState } from 'redux/modules';
import SettingsForm from 'components/SettingsForm';

import CountsTable from 'components/CountsTable';

import changelog from '../CHANGELOG.json';

type Props = {
  adminAsLA: boolean;
  toggleAdminAsLA: () => void;
};

const MODAL_STYLE = {
  overlay: { marginTop: 50, zIndex: 10 },
};

const NAVBAR_ID = 'laNavBar';

const VERSION = changelog.changes[0].split('\n')[0].replace(/[\s#]+/, '');

const NavBar = ({ adminAsLA, toggleAdminAsLA }: Props) => {
  const { isAdmin, loading, logout, name, username } = Redux(
    (state: AppReduxState) => ({
      loading: state.loading,
      isAdmin: state.isAdmin,
      logout: state.logout,
      name: state.name,
      username: state.username,
    }),
    shallow
  );
  const [showingSettings, setSettingsVisibility] = useState(
    !isAdmin && (username === name || name === null || name.trim().length === 0)
  );
  const [showingChangelog, setChangelogVisibility] = useState(false);
  const [showingStats, setStatsVisibility] = useState(false);

  const hideSettings = useCallback(() => {
    setSettingsVisibility(false);
  }, [setSettingsVisibility]);

  const toggleSettings = useCallback(() => {
    if (showingSettings) {
      setSettingsVisibility(false);
    } else {
      setChangelogVisibility(false);
      setStatsVisibility(false);
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
      setStatsVisibility(false);
      setChangelogVisibility(true);
    }
  }, [showingChangelog, setChangelogVisibility, setSettingsVisibility]);

  const hideStats = useCallback(() => {
    setStatsVisibility(false);
  }, [setStatsVisibility]);

  const toggleStats = useCallback(() => {
    if (showingStats) {
      setStatsVisibility(false);
    } else {
      setSettingsVisibility(false);
      setChangelogVisibility(false);
      setStatsVisibility(true);
    }
  }, [showingStats]);

  const toggleAdminStatus = useCallback(() => {
    if (!isAdmin) return;

    toggleAdminAsLA();
    hideSettings();
    hideChangelog();
    hideStats();
  }, [isAdmin, toggleAdminAsLA, hideSettings, hideChangelog, hideStats]);

  if (loading) return null;

  const buttonStyle = { color: '#FFFFFF80' };

  return (
    <>
      <Navbar
        fixed="top"
        expand="md"
        bg="dark"
        variant="dark"
        role="navigation"
      >
        <Navbar.Brand style={{ marginBottom: 0 }}>
          {`LA Feedback${isAdmin ? ' Admin' : ''}`}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls={NAVBAR_ID} />

        <Navbar.Collapse id={NAVBAR_ID}>
          <Nav variant="pills">
            <Nav.Item>
              <Button
                style={buttonStyle}
                type="button"
                variant="dark"
                onClick={toggleChangelog}
              >
                <small>{`v${VERSION}`}</small>
              </Button>
            </Nav.Item>
            <NavDropdown
              title="Resources"
              id="resourceDropdown"
              style={{ color: '#ffffff' }}
            >
              <NavDropdown.Item
                role="link"
                href="https://cse-apps.unl.edu/handin"
                rel="noopener noreferrer"
                target="_blank"
              >
                CSE Handin
              </NavDropdown.Item>

              <NavDropdown.Item
                role="link"
                href="https://cse.unl.edu/faq"
                rel="noopener noreferrer"
                target="_blank"
              >
                CSE FAQ
              </NavDropdown.Item>
              <NavDropdown.Item
                role="link"
                href="https://cse.unl.edu/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Department Home
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                role="link"
                href="https://canvas.unl.edu/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Canvas
              </NavDropdown.Item>
            </NavDropdown>
            {isAdmin && (
              <Nav.Item>
                <Button
                  style={buttonStyle}
                  role="button"
                  variant="dark"
                  type="button"
                  onClick={toggleAdminStatus}
                >
                  {adminAsLA ? 'Admin Panel' : 'LA Page'}
                </Button>
              </Nav.Item>
            )}
            {(!isAdmin || adminAsLA) && (
              <Nav.Item>
                <Button
                  style={buttonStyle}
                  role="button"
                  variant="dark"
                  type="button"
                  onClick={toggleSettings}
                >
                  LA Settings
                </Button>
              </Nav.Item>
            )}
            <Nav.Item>
              <Button
                style={buttonStyle}
                role="button"
                variant="dark"
                type="button"
                onClick={toggleStats}
              >
                Stats
              </Button>
            </Nav.Item>
            <Nav.Item>
              <Button
                style={buttonStyle}
                role="button"
                variant="dark"
                type="button"
                onClick={logout}
              >
                Logout
              </Button>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
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
          <SettingsForm closeModal={hideSettings} />
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
          {changelog.changes.map((change) => (
            <ReactMarkdown source={change} />
          ))}
        </div>
      </Modal>
      <Modal
        isOpen={showingStats}
        onRequestClose={hideStats}
        contentLabel="Course Interactions"
        style={MODAL_STYLE}
      >
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
          onClick={hideStats}
        >
          <span aria-hidden="true">×</span>
        </button>
        <CountsTable />
        <BreakdownTable style={{ marginTop: 20 }} />
      </Modal>
    </>
  );
};

export default NavBar;
