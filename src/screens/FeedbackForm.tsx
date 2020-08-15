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
  useState,
} from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';

import shallow from 'zustand/shallow';

import Redux, { api } from 'redux/modules';

import { COURSES } from 'statics/Types';

const LA_USERNAME_ID = 'la_username';
const COURSE_ID = 'course';
const STUDENT_CSE_ID = 'student_cse_login';

const LA_LABEL = 'LA CSE Username';
const COURSE_LABEL = 'Course';
const STUDENT_LABEL = 'Student CSE Username';

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
    setResponse,
    sendEmail,
  } = Redux(
    (state) => ({
      username: state.username,
      selectedUsername: state.selectedUsername,
      setSelectedUsername: state.setSelectedUsername,
      course: state.course,
      isAdmin: state.isAdmin,
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

  useEffect(() => {
    api.subscribe(
      (newCourse) => {
        if (
          newCourse !== null &&
          typeof newCourse === 'string' &&
          newCourse !== courseRecord
        ) {
          setCourseRecord(newCourse);
        }
      },
      (state) => state.course
    );
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      const studentUserValid = studentCSE && studentCSE.trim().length > 0;
      const courseIsValid =
        courseRecord &&
        courseRecord.trim().length > 0 &&
        courseRecord !== 'choose';
      const laUserValid =
        usernameRecord &&
        usernameRecord.trim().length > 0 &&
        usernameRecord !== studentCSE;

      if (studentUserValid && courseIsValid && laUserValid) {
        if (isAdmin) {
          setSelectedUsername({ username: usernameRecord });
        }

        // Send to all students listed (Based on regex expression /[,\s|&+;]/)
        const students = Array.from(
          new Set(studentCSE?.split(/[,\s|&+;]/) ?? [])
        )
          .map((student) => student.trim())
          .filter((student) => student.length > 0);

        students.forEach((student: string) =>
          sendEmail(student, courseRecord, students.length > 1)
        );

        setStudentCSE('');
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
        }
        setResponse({
          class: 'danger',
          content: `${issue} is invalid`,
        });
      }

      // Never reload
      event.preventDefault();
      return false;
    },
    [
      isAdmin,
      studentCSE,
      courseRecord,
      usernameRecord,
      setResponse,
      sendEmail,
      setSelectedUsername,
    ]
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
              autoComplete="false"
            />
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
            >
              Submit
            </Button>
          </div>
        </FormGroup>
      </Form>
    </div>
  );
};

export default FeedbackForm;
