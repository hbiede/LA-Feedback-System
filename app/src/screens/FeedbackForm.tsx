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
    setSelectedUsername,
    course,
    isAdmin,
    setResponse,
    sendEmail,
  } = Redux(
    (state) => ({
      username: state.username,
      name: state.username,
      selectedUsername: state.selectedUsername,
      setSelectedUsername: state.setSelectedUsername,
      course: state.course,
      isAdmin: state.isAdmin,
      setResponse: state.setResponse,
      sendEmail: state.sendEmail,
    }),
    shallow
  );

  const [validated, setValidated] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [usernameRecord, setUsernameRecord] = useState<string>(
    isAdmin ? selectedUsername : username
  );
  const [studentCSE, setStudentCSE] = useState('');
  const [courseRecord, setCourseRecord] = useState<string | null>(course);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValidated(false);
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
        default:
          alert(`${id} is an invalid ID`);
          break;
      }
    },
    [isAdmin]
  );

  const handleSubmit = useCallback(() => {
    setValidated(true);
    if (!isAdmin && (name === null || name.trim().length === 0)) {
      setResponse({
        class: 'danger',
        content:
          'Please set your name before submitting feedback (See the LA Settings)',
      });
      return;
    }
    setResponse(null);
    setDisabled(true);

    if (
      studentCSE &&
      studentCSE.trim().length > 0 &&
      courseRecord &&
      courseRecord.trim().length > 0 &&
      courseRecord !== 'choose' &&
      usernameRecord &&
      usernameRecord.trim().length > 0 &&
      usernameRecord !== studentCSE
    ) {
      if (isAdmin) {
        setSelectedUsername({ username: usernameRecord });
      }
      sendEmail(studentCSE);
    }
  }, [
    isAdmin,
    name,
    studentCSE,
    courseRecord,
    usernameRecord,
    setResponse,
    sendEmail,
    setSelectedUsername,
  ]);

  return (
    <div className="col-md-6">
      <Form noValidate>
        <FormGroup as={Row} controlId={LA_USERNAME_ID}>
          <Form.Label htmlFor="la_username" className="col-sm-4">
            LA CSE Username
          </Form.Label>
          <div className="col-sm-8">
            <Form.Control
              type="text"
              role="textbox"
              value={
                usernameRecord.trim().length > 0 ? usernameRecord : undefined
              }
              placeholder="LA CSE Username"
              aria-placeholder="LA CSE Username"
              onChange={handleChange}
              disabled={!isAdmin}
              isValid={false}
              isInvalid={validated && usernameRecord.trim().length === 0}
              aria-invalid={validated && usernameRecord.trim().length === 0}
              required
              aria-required
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
              role="combobox"
              placeholder="Course"
              onChange={handleChange}
              required
              aria-required
              custom
              isValid={false}
              isInvalid={
                validated &&
                (courseRecord === null ||
                  courseRecord.trim().length === 0 ||
                  courseRecord === 'choose')
              }
              aria-invalid={
                validated &&
                (courseRecord === null ||
                  courseRecord.trim().length === 0 ||
                  courseRecord === 'choose')
              }
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
            <Form.Control.Feedback type="invalid">
              Choose a course
            </Form.Control.Feedback>
          </div>
        </FormGroup>

        <FormGroup as={Row} controlId={STUDENT_CSE_ID}>
          <Form.Label className="col-sm-4">Student CSE</Form.Label>
          <div className="col-sm-8">
            <Form.Control
              type="text"
              role="textbox"
              placeholder="Student CSE Login"
              aria-placeholder="Student CSE Login"
              onChange={handleChange}
              required
              aria-required
              isValid={false}
              isInvalid={
                validated &&
                (studentCSE === null ||
                  usernameRecord === studentCSE ||
                  studentCSE.trim().length === 0)
              }
              aria-invalid={
                validated &&
                (studentCSE === null ||
                  usernameRecord === studentCSE ||
                  studentCSE.trim().length === 0)
              }
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
    </div>
  );
};

export default FeedbackForm;
