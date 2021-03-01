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

import shallow from 'zustand/shallow';

import Redux, { api, AppReduxState } from 'redux/modules';

import { Student } from '../redux/modules/Types';
import StudentSelectionTypeahead from '../components/StudentSelectionTypeahead';

const LA_USERNAME_ID = 'la_username';
const COURSE_ID = 'course';
const STUDENT_ID = 'student_login';
const INTERACTION_TYPE_ID = 'interaction_type';

const LA_LABEL = 'LA Canvas Username';
const COURSE_LABEL = 'Course';
const STUDENT_LABEL = 'Student';
const INTERACTION_TYPE_LABEL = 'Interaction Type';

type Props = {
  style?: CSSProperties;
};

/**
 * The main page for interaction logging
 */
const FeedbackForm = ({ style }: Props) => {
  const {
    username,
    selectedUsername,
    setSelectedUsername,
    courses,
    course,
    isAdmin,
    incrementSessionInteractions,
    sessionInteractions,
    setResponse,
    logInteraction,
  } = Redux(
    (state: AppReduxState) => ({
      username: state.username,
      selectedUsername: state.selectedUsername,
      setSelectedUsername: state.setSelectedUsername,
      courses: state.courses,
      course: state.course,
      isAdmin: state.isAdmin,
      incrementSessionInteractions: state.incrementSessionInteractions,
      sessionInteractions: state.sessionInteractions,
      setResponse: state.setResponse,
      logInteraction: state.logInteraction,
    }),
    shallow
  );

  const [usernameRecord, setUsernameRecord] = useState<string>(
    isAdmin ? selectedUsername : username
  );
  const [disabled, setDisabled] = useState(false);
  const [courseRecord, setCourseRecord] = useState<string | null>(course);
  const [students, setStudents] = useState<Student[]>([]);
  const setStudentCallback = (newStudents: Student[]) => {
    if (
      !courseRecord ||
      (courseRecord === 'choose' && newStudents.length > 0)
    ) {
      setCourseRecord(newStudents[0].course);
    }
    setStudents(newStudents);
    setDisabled(false);
  };
  const [interactionTypeRecord, setInteractionTypeRecord] = useState<
    string | null
  >(course);

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
          setStudents([]);
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

      const studentUserValid = students && students.length > 0;
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
        !students.some((student) => student.canvas_username === usernameRecord);

      if (studentUserValid && courseIsValid && intTypeIsValid && laUserValid) {
        if (isAdmin) {
          setSelectedUsername({ username: usernameRecord });
        }

        students.forEach((student: Student) => {
          incrementSessionInteractions(student.canvas_username);
          logInteraction(
            student.id,
            student.course,
            students.length > 1,
            interactionTypeRecord
          );
        });
        setStudents([]);
      } else {
        let issue = 'A field';
        if (!studentUserValid) {
          issue = "The student's username";
        } else if (!courseIsValid) {
          issue = 'The course username';
        } else if (!laUserValid) {
          issue = "The LA's username";
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
      students,
      courseRecord,
      interactionTypeRecord,
      usernameRecord,
      isAdmin,
      incrementSessionInteractions,
      setSelectedUsername,
      logInteraction,
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
    const studentsHelped = Object.keys(sessionInteractions)
      .sort((a, b) => a.localeCompare(b))
      .map((student) => `${student} (${sessionInteractions[student]})`);
    return `Student${
      studentsHelped.length > 0 ? 's' : ''
    } helped:\n${studentsHelped.join(', ')}`;
  }, [sessionInteractions]);
  const toggleSessionCollapsable = useCallback(
    () => setSessionTextOpen(!isSessionTextOpen),
    [isSessionTextOpen]
  );

  return (
    <div className="col-md-8" style={style}>
      <Form noValidate>
        <FormGroup as={Row} controlId={LA_USERNAME_ID}>
          <Form.Label htmlFor="la_username" className="col-sm-3">
            {LA_LABEL}
          </Form.Label>
          <div className="col-sm-9">
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
          <Form.Label className="col-sm-3">{COURSE_LABEL}</Form.Label>
          <div className="col-sm-9">
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
                  courseRecord !== null && !courses.includes(courseRecord)
                }
              >
                (choose)
              </option>
              {courses.map((c) => (
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

        <FormGroup as={Row} controlId={STUDENT_ID}>
          <Form.Label className="col-sm-3">{STUDENT_LABEL}</Form.Label>
          <div className="col-sm-9">
            <StudentSelectionTypeahead
              id={STUDENT_ID}
              placeholder={STUDENT_LABEL}
              selected={students}
              onChange={setStudentCallback}
              course={courseRecord}
              inputProps={{
                type: 'text',
                role: 'textbox',
                'aria-placeholder': STUDENT_LABEL,
                required: true,
                'aria-required': true,
                'aria-haspopup': true,
                autoComplete: 'false',
              }}
            />
          </div>
        </FormGroup>

        <FormGroup as={Row} controlId={INTERACTION_TYPE_ID}>
          <Form.Label className="col-sm-3">{INTERACTION_TYPE_LABEL}</Form.Label>
          <div className="col-sm-9">
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
        type="button"
        variant="secondary"
        disabled={Object.keys(sessionInteractions).length === 0}
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
