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

import Redux from 'redux/modules';
import SettingsForm from 'components/SettingsForm';

import packageJson from '../../package.json';
import changelog from '../CHANGELOG.json';
import AveragesTable from './AveragesTable';

type Props = {
  adminAsLA: boolean;
  toggleAdminAsLA: () => void;
};

const MODAL_STYLE = {
  overlay: { marginTop: 50, zIndex: 2 },
};

const NAVBAR_ID = 'laNavBar';

const NavBar = ({ adminAsLA, toggleAdminAsLA }: Props) => {
  const { isAdmin, loading, logout, name, username } = Redux(
    (state) => ({
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
  const [showingCourseAverages, setCourseAveragesVisibility] = useState(false);

  const hideSettings = useCallback(() => {
    setSettingsVisibility(false);
  }, [setSettingsVisibility]);

  const toggleSettings = useCallback(() => {
    if (showingSettings) {
      setSettingsVisibility(false);
    } else {
      setChangelogVisibility(false);
      setCourseAveragesVisibility(false);
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
      setCourseAveragesVisibility(false);
      setChangelogVisibility(true);
    }
  }, [showingChangelog, setChangelogVisibility, setSettingsVisibility]);

  const hideCourseAverages = useCallback(() => {
    setCourseAveragesVisibility(false);
  }, [setCourseAveragesVisibility]);

  const toggleCourseAverages = useCallback(() => {
    if (!isAdmin) return;

    if (showingCourseAverages) {
      setCourseAveragesVisibility(false);
    } else {
      setSettingsVisibility(false);
      setChangelogVisibility(false);
      setCourseAveragesVisibility(true);
    }
  }, [isAdmin, showingCourseAverages]);

  const toggleAdminStatus = useCallback(() => {
    if (!isAdmin) return;

    toggleAdminAsLA();
    hideSettings();
    hideChangelog();
    hideCourseAverages();
  }, [
    isAdmin,
    toggleAdminAsLA,
    hideSettings,
    hideChangelog,
    hideCourseAverages,
  ]);

  if (loading) return null;

  if (!changelog.changes[0].includes(packageJson.version)) {
    return (
      <Modal
        isOpen
        onRequestClose={() => {}}
        contentLabel="Changelog"
        style={{ overlay: { marginTop: 50 } }}
      >
        <div>Someone forgot to update the changelog and/or version number</div>
      </Modal>
    );
  }

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
                <small>{`v${packageJson.version}`}</small>
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
            {isAdmin && (
              <Nav.Item>
                <Button
                  style={buttonStyle}
                  role="button"
                  variant="dark"
                  type="button"
                  onClick={toggleCourseAverages}
                >
                  Course Avgs
                </Button>
              </Nav.Item>
            )}
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
        isOpen={showingCourseAverages}
        onRequestClose={hideCourseAverages}
        contentLabel="Course Averages"
        style={MODAL_STYLE}
      >
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
          onClick={hideCourseAverages}
        >
          <span aria-hidden="true">×</span>
        </button>
        <AveragesTable />
      </Modal>
    </>
  );
};

export default NavBar;
