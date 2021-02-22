/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';

import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';

import shallow from 'zustand/shallow';

import Redux, { api, AppReduxState } from 'redux/modules';

import ServiceInterface from '../statics/ServiceInterface';

type Props = {
  closeModal: () => void;
};

const SELECTED_USERNAME_ID = 'selected_username';
const LA_NAME_ID = 'la_name';
const COURSE_ID = 'course';

/**
 * Allows for modification of LA name and default course
 */
const SettingsForm = ({ closeModal }: Props) => {
  const {
    selectedUsername,
    setSelectedUsername,
    name,
    setName,
    course,
    courses,
    setCourse,
    isAdmin,
    setResponse,
  } = Redux(
    (state: AppReduxState) => ({
      selectedUsername: state.selectedUsername,
      setSelectedUsername: state.setSelectedUsername,
      name: state.name,
      setName: state.setName,
      course: state.course,
      courses: state.courses,
      setCourse: state.setCourse,
      isAdmin: state.isAdmin,
      setResponse: state.setResponse,
    }),
    shallow
  );

  const [validated, setValidated] = useState(false);
  const [selectedUsernameRecord, setSelectedUsernameRecord] = useState<string>(
    selectedUsername
  );
  const [nameRecord, setNameRecord] = useState<string>(name);
  const [courseRecord, setCourseRecord] = useState<string | null>(course);
  const [hasSelectedUsername, setHasSelectedUsername] = useState<boolean>(
    !isAdmin ||
      (selectedUsername !== null && selectedUsername.trim().length > 0)
  );

  useEffect(() => {
    api.subscribe(
      (newCourse: string | null) => {
        if (newCourse !== null && newCourse !== courseRecord) {
          setCourseRecord(newCourse);
        }
      },
      (state) => state.course
    );

    api.subscribe(
      (newName: string | null) => {
        if (newName !== null && newName !== nameRecord) {
          setNameRecord(newName);
        }
      },
      (state) => state.name
    );
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValidated(false);
      const { id, value } = event.target;
      switch (id) {
        case SELECTED_USERNAME_ID:
          setSelectedUsernameRecord(value);
          break;
        case LA_NAME_ID:
          setNameRecord(value);
          break;
        case COURSE_ID:
          const isChoose = value === 'choose';
          setCourseRecord(isChoose ? null : value);
          break;
        default:
          setResponse({
            class: 'danger',
            content: `${id} is an invalid ID`,
          });
          break;
      }
    },
    [setResponse]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLElement>) => {
      setValidated(true);
      if (hasSelectedUsername) {
        const trimmedName = nameRecord.trim();
        if (trimmedName.length > 0 && name !== trimmedName) {
          setName({ name: trimmedName });
        }
        if (
          courseRecord !== null &&
          courseRecord !== 'choose' &&
          course !== courseRecord
        ) {
          setTimeout(() => setCourse({ course: courseRecord }), 1000);
        }
        if (!isAdmin && trimmedName.length > 0) {
          closeModal();
        }
      } else if (isAdmin) {
        setSelectedUsernameRecord(selectedUsernameRecord);
        setSelectedUsername({ username: selectedUsernameRecord });
        setHasSelectedUsername(true);
      }

      // Never reload
      event.preventDefault();
      return false;
    },
    [
      hasSelectedUsername,
      isAdmin,
      nameRecord,
      name,
      courseRecord,
      course,
      setName,
      setCourse,
      closeModal,
      selectedUsernameRecord,
      setSelectedUsername,
    ]
  );

  const changeLA = useCallback(() => {
    setSelectedUsername({ username: '' });
    setHasSelectedUsername(false);
  }, [setSelectedUsername]);

  const disabled =
    (hasSelectedUsername && (!nameRecord || nameRecord.trim().length === 0)) ||
    (!hasSelectedUsername &&
      isAdmin &&
      (!selectedUsernameRecord || selectedUsernameRecord.trim().length === 0));

  if (/^cse\d/.test(selectedUsername)) {
    return (
      <>
        <h2>May not login as a course account</h2>
        <Button
          id="settingsLogoutButton"
          type="reset"
          variant={isAdmin ? 'outline-danger' : 'danger'}
          value="Logout"
          onClick={ServiceInterface.logout}
        >
          Logout
        </Button>
        {isAdmin && (
          <Button
            id="submitButton"
            type="reset"
            variant="primary"
            value="Change LA"
            onClick={changeLA}
            style={{ marginLeft: 10 }}
          >
            Change LA
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <h2>
        {`LA Settings${
          isAdmin
            ? ` (${hasSelectedUsername ? selectedUsername : 'Admin Panel'})`
            : ''
        }`}
      </h2>
      <Form noValidate onSubmit={handleSubmit}>
        {hasSelectedUsername ? (
          <>
            <Form.Group as={Row} controlId={LA_NAME_ID} className="col-sm-8">
              <Form.Label>{isAdmin ? "LA's Name" : 'Your Name'}</Form.Label>
              <Form.Control
                type="text"
                defaultValue={name}
                placeholder={isAdmin ? "LA's Name" : 'Your Name'}
                value={nameRecord || ''}
                onChange={handleChange}
                isValid={
                  validated &&
                  nameRecord !== null &&
                  nameRecord.trim().length > 0
                }
                autoComplete="false"
              />
              <Form.Control.Feedback type="invalid">
                Must enter a name
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Row} controlId={COURSE_ID} className="col-sm-8">
              <Form.Label>Default Course</Form.Label>
              <OverlayTrigger
                overlay={
                  <Tooltip id="selection-tooltip">
                    The default-selected class when you log in
                  </Tooltip>
                }
              >
                <Form.Control
                  as="select"
                  onChange={handleChange}
                  defaultValue={course}
                  custom
                >
                  <option value="choose">(choose)</option>
                  {courses.map((c) => (
                    <option value={c} selected={course === c}>
                      {c}
                    </option>
                  ))}
                </Form.Control>
              </OverlayTrigger>
            </Form.Group>
            {isAdmin && (
              <Form.Group as={Row} className="col-sm-8">
                <Button
                  id="submitButton"
                  type="reset"
                  variant="primary"
                  value="Change LA"
                  onClick={changeLA}
                >
                  Change LA
                </Button>
              </Form.Group>
            )}
          </>
        ) : (
          <Form.Group
            as={Row}
            controlId={SELECTED_USERNAME_ID}
            className="col-sm-8"
          >
            <Form.Label>Username to Modify</Form.Label>
            <Form.Control
              type="text"
              placeholder="Username to Modify"
              className="form-control"
              name="selected_username"
              value={
                selectedUsernameRecord.length > 0
                  ? selectedUsernameRecord
                  : undefined
              }
              onChange={handleChange}
              autoComplete="false"
            />
          </Form.Group>
        )}
        <Form.Group as={Row} className="col-sm-8">
          <Button
            id="submitButton"
            type="submit"
            variant="primary"
            value="Submit"
            disabled={disabled}
            aria-disabled={disabled}
          >
            Submit
          </Button>
        </Form.Group>
      </Form>
    </>
  );
};

export default SettingsForm;
