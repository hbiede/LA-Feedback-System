/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

/* eslint-disable no-alert */
import React, { ChangeEvent, useCallback, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';

import shallow from 'zustand/shallow';

import Redux from 'redux/modules';

import { COURSES } from 'statics/Types';

const LA_USERNAME_ID = 'la_username';
const COURSE_ID = 'course';
const STUDENT_CSE_ID = 'student_cse_login';

const FeedbackForm = () => {
  const {
    username,
    name,
    selectedUsername,
    course,
    isAdmin,
    setResponse,
    sendEmail,
  } = Redux(
    (state) => ({
      username: state.username,
      name: state.username,
      selectedUsername: state.selectedUsername,
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
  const [disabled, setDisabled] = useState(true);
  const [studentCSE, setStudentCSE] = useState('');
  const [courseRecord, setCourseRecord] = useState<string | null>(null);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (!isAdmin) {
        return;
      }

      const { id, value } = event.target;
      switch (id) {
        case LA_USERNAME_ID:
          if (isAdmin) {
            setUsernameRecord(value);
          }
          break;
        case COURSE_ID:
          setCourseRecord(value);
          break;
        case STUDENT_CSE_ID:
          setStudentCSE(value);
          break;
        default:
          alert(`${id} is an invalid ID`);
          break;
      }
      const shouldBeDisabled =
        course === 'choose' ||
        studentCSE.trim().length === 0 ||
        usernameRecord.trim().length === 0;
      if (disabled !== shouldBeDisabled) {
        setDisabled(shouldBeDisabled);
      }
    },
    [
      course,
      setCourseRecord,
      disabled,
      isAdmin,
      studentCSE,
      setStudentCSE,
      usernameRecord,
      setUsernameRecord,
    ]
  );

  const handleSubmit = useCallback(() => {
    if (!isAdmin && name === null) {
      setResponse({
        class: 'danger',
        content:
          'Please set your name before submitting feedback (See the LA Settings)',
      });
      return;
    }

    if (
      studentCSE &&
      studentCSE.trim().length > 0 &&
      course &&
      course.trim().length > 0
    ) {
      setDisabled(true);
      sendEmail(studentCSE);
    } else {
      setResponse({
        class: 'danger',
        content:
          studentCSE && studentCSE.trim().length > 0
            ? 'Invalid course'
            : 'Invalid student',
      });
    }
  }, [isAdmin, name, studentCSE, course, setResponse, sendEmail]);

  return (
    <div className="col-md-6">
      <Form>
        <FormGroup as={Row} controlId={LA_USERNAME_ID}>
          <Form.Label htmlFor="la_username" className="col-sm-4">
            LA CSE Username
          </Form.Label>
          <div className="col-sm-8">
            <Form.Control
              type="text"
              value={usernameRecord}
              onChange={handleChange}
              disabled={!isAdmin}
              required
            />
            <Form.Control.Feedback type="invalid">
              Must enter a username
            </Form.Control.Feedback>
          </div>
        </FormGroup>

        <FormGroup as={Row} controlId={COURSE_ID}>
          <Form.Label className="col-sm-4">Course</Form.Label>
          <div className="col-sm-8">
            <Form.Control
              as="select"
              placeholder="Course"
              onChange={handleChange}
              required
              custom
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
                <option value={c} selected={c === (courseRecord ?? course)}>
                  {c}
                </option>
              ))}
            </Form.Control>
          </div>
        </FormGroup>

        <FormGroup as={Row} controlId={STUDENT_CSE_ID}>
          <Form.Label className="col-sm-4">Student CSE</Form.Label>
          <div className="col-sm-8">
            <Form.Control
              type="text"
              placeholder="Student CSE Login"
              onChange={handleChange}
              required
              isValid={usernameRecord !== studentCSE}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid username
            </Form.Control.Feedback>
          </div>
        </FormGroup>

        <FormGroup>
          <div className="col-sm-9">
            <Button
              id="submitButton"
              type="button"
              variant="primary"
              value="Submit"
              onClick={handleSubmit}
              disabled={disabled}
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
