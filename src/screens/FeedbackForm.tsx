/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, {
  ChangeEvent,
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';

import shallow from 'zustand/shallow';

import OverlayTrigger from 'react-bootstrap/esm/OverlayTrigger';

import Redux, { api, AppReduxState } from 'redux/modules';

import { COURSES } from 'statics/Types';

const LA_USERNAME_ID = 'la_username';
const COURSE_ID = 'course';
const STUDENT_CSE_ID = 'student_cse_login';
const INTERACTION_TYPE_ID = 'interaction_type';

const LA_LABEL = 'LA CSE Username';
const COURSE_LABEL = 'Course';
const STUDENT_LABEL = 'Student CSE Username';
const INTERACTION_TYPE_LABEL = 'Interaction Type';

const BANNED_USERNAMES = [...COURSES, '155h', '156h', 'i', "don't", 'know'];

type Props = {
  style?: CSSProperties;
};

const FeedbackForm = ({ style }: Props) => {
  const {
    username,
    selectedUsername,
    setSelectedUsername,
    course,
    isAdmin,
    incrementSessionInteractions,
    sessionInteractions,
    setResponse,
    sendEmail,
  } = Redux(
    (state: AppReduxState) => ({
      username: state.username,
      selectedUsername: state.selectedUsername,
      setSelectedUsername: state.setSelectedUsername,
      course: state.course,
      isAdmin: state.isAdmin,
      incrementSessionInteractions: state.incrementSessionInteractions,
      sessionInteractions: state.sessionInteractions,
      setResponse: state.setResponse,
      sendEmail: state.sendEmail,
    }),
    shallow
  );

  const [usernameRecord, setUsernameRecord] = useState<string>(
    isAdmin ? selectedUsername : username
  );
  const [studentCSE, setStudentCSE] = useState<string>('');
  const [courseRecord, setCourseRecord] = useState<string | null>(course);
  const [interactionTypeRecord, setInteractionTypeRecord] = useState<
    string | null
  >(course);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    api.subscribe(
      (newCourse: string | null) => {
        if (newCourse !== null && newCourse !== courseRecord) {
          setCourseRecord(newCourse);
        }
      },
      (state) => state.course
    );
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDisabled(false);
      const { id, value } = event.target;
      switch (id) {
        case LA_USERNAME_ID:
          if (isAdmin) {
            setUsernameRecord(value);
          }
          break;
        case COURSE_ID:
          setCourseRecord(value === 'choose' ? null : value);
          break;
        case STUDENT_CSE_ID:
          setStudentCSE(value);
          break;
        case INTERACTION_TYPE_ID:
          setInteractionTypeRecord(value);
          break;
        default:
          setResponse({ content: `${id} is an invalid ID`, class: 'danger' });
          break;
      }
    },
    [isAdmin, setResponse]
  );

  const handleSubmit = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      setResponse(null);
      setDisabled(true);

      const studentUserValid = studentCSE && studentCSE.trim().length > 0;
      const courseIsValid =
        courseRecord &&
        courseRecord.trim().length > 0 &&
        courseRecord !== 'choose';
      const intTypeIsValid =
        interactionTypeRecord &&
        interactionTypeRecord.trim().length > 0 &&
        interactionTypeRecord !== 'choose';
      const laUserValid =
        usernameRecord &&
        usernameRecord.trim().length > 0 &&
        usernameRecord !== studentCSE;

      if (studentUserValid && courseIsValid && intTypeIsValid && laUserValid) {
        if (isAdmin) {
          setSelectedUsername({ username: usernameRecord });
        }

        // Send to all students listed (Based on regex expression /[,\s|&+;]/)
        const students = Array.from(new Set(studentCSE?.split(/[,|&+;]/) ?? []))
          .map((student) => student.trim())
          .filter((student) => student.length > 0);

        if (
          students.some(
            (student) =>
              BANNED_USERNAMES.includes(student.toLowerCase()) ||
              student.includes('(') ||
              student.includes(')') ||
              student.includes(' ')
          )
        ) {
          setResponse({ class: 'danger', content: 'Invalid username(s)' });
        } else {
          students.forEach((student: string) => {
            incrementSessionInteractions(student);
            sendEmail(
              student,
              courseRecord,
              students.length > 1,
              interactionTypeRecord
            );
          });

          setStudentCSE('');
        }
      } else {
        let issue = 'A field';
        if (!studentUserValid) {
          issue = "The student's username";
        } else if (!courseIsValid) {
          issue = 'The course username';
        } else if (!laUserValid) {
          issue =
            usernameRecord === studentCSE
              ? 'You cannot Self-interact'
              : "The LA's username";
        } else if (!intTypeIsValid) {
          issue = 'The interaction type';
        }
        setResponse({
          class: 'danger',
          content: `${issue} is invalid`,
        });
      }

      // Prevent reload
      event.preventDefault();
      return false;
    },
    [
      setResponse,
      studentCSE,
      courseRecord,
      interactionTypeRecord,
      usernameRecord,
      isAdmin,
      incrementSessionInteractions,
      setSelectedUsername,
      sendEmail,
    ]
  );

  const [isSessionTextOpen, setSessionTextOpen] = useState(false);
  const sessionCountText = useMemo(
    () =>
      `Student interactions this session: ${
        Object.keys(sessionInteractions).length
      }`,
    [sessionInteractions]
  );
  const expandedSessionCountText = useMemo(() => {
    const students = Object.keys(sessionInteractions).sort((a, b) =>
      a.localeCompare(b)
    );
    return `Student${students.length > 0 ? 's' : ''} helped:\n${students.join(
      ', '
    )}`;
  }, [sessionInteractions]);
  const toggleSessionCollapsable = useCallback(
    () => setSessionTextOpen(!isSessionTextOpen),
    [isSessionTextOpen]
  );

  return (
    <div className="col-md-7" style={style}>
      <Form noValidate>
        <FormGroup as={Row} controlId={LA_USERNAME_ID}>
          <Form.Label htmlFor="la_username" className="col-sm-5">
            {LA_LABEL}
          </Form.Label>
          <div className="col-sm-7">
            <Form.Control
              type="text"
              role="textbox"
              value={
                usernameRecord.trim().length > 0 ? usernameRecord : undefined
              }
              placeholder={LA_LABEL}
              aria-placeholder={LA_LABEL}
              onChange={handleChange}
              disabled={!isAdmin}
              readOnly={!isAdmin}
              required
              aria-required
              autoComplete="false"
            />
          </div>
        </FormGroup>

        <FormGroup as={Row} controlId={COURSE_ID}>
          <Form.Label className="col-sm-5">{COURSE_LABEL}</Form.Label>
          <div className="col-sm-7">
            <Form.Control
              as="select"
              role="combobox"
              placeholder={COURSE_LABEL}
              onChange={handleChange}
              required
              aria-required
              custom
              value={courseRecord ?? 'choose'}
            >
              <option
                value="choose"
                hidden
                aria-hidden
                selected={
                  courseRecord !== null && !COURSES.includes(courseRecord)
                }
              >
                (choose)
              </option>
              {COURSES.map((c) => (
                <option
                  value={c}
                  selected={c === (courseRecord ?? course)}
                  aria-selected={c === (courseRecord ?? course)}
                >
                  {c}
                </option>
              ))}
            </Form.Control>
          </div>
        </FormGroup>

        <FormGroup as={Row} controlId={STUDENT_CSE_ID}>
          <Form.Label className="col-sm-5">{STUDENT_LABEL}</Form.Label>
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="username-tooltip">
                Submit multiple usernames with a comma separated list
              </Tooltip>
            }
          >
            <div className="col-sm-7">
              <Form.Control
                type="text"
                role="textbox"
                placeholder={STUDENT_LABEL}
                aria-placeholder={STUDENT_LABEL}
                value={studentCSE ?? undefined}
                onChange={handleChange}
                required
                aria-required
                aria-haspopup
                autoComplete="false"
              />
            </div>
          </OverlayTrigger>
        </FormGroup>

        <FormGroup as={Row} controlId={INTERACTION_TYPE_ID}>
          <Form.Label className="col-sm-5">{INTERACTION_TYPE_LABEL}</Form.Label>
          <div className="col-sm-7">
            <Form.Control
              as="select"
              role="combobox"
              placeholder={INTERACTION_TYPE_LABEL}
              onChange={handleChange}
              required
              aria-required
              custom
            >
              <option value="choose" hidden aria-hidden>
                (choose)
              </option>
              <option value="cohort meeting">Cohort</option>
              <option value="hack">Hack</option>
              <option value="lab">Lab</option>
              <option value="office hour">Office Hour</option>
            </Form.Control>
          </div>
        </FormGroup>

        <FormGroup>
          <div className="col-sm-9">
            <Button
              id="submitButton"
              role="button"
              type="submit"
              variant="primary"
              value="Submit"
              onClick={handleSubmit}
              disabled={disabled}
              aria-disabled={disabled}
            >
              Submit
            </Button>
          </div>
        </FormGroup>
      </Form>
      <Button
        onClick={toggleSessionCollapsable}
        aria-expanded={isSessionTextOpen}
      >
        {sessionCountText}
      </Button>
      <Collapse in={isSessionTextOpen}>
        <div>{expandedSessionCountText}</div>
      </Collapse>
    </div>
  );
};

FeedbackForm.defaultProps = {
  style: {},
};

export default FeedbackForm;
