/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

/* eslint-disable no-alert */
import React, {
  ChangeEvent, useCallback, useState,
} from 'react';

import shallow from 'zustand/shallow';

import Redux from '../redux/modules';

import { COURSES } from '../statics/Types';

const FeedbackForm = () => {
  const {
    username,
    name,
    selectedUsername,
    course,
    isAdmin,
    setResponse,
    sendEmail,
  } = Redux((state) => (
    {
      username: state.username,
      name: state.username,
      selectedUsername: state.selectedUsername,
      course: state.course,
      isAdmin: state.isAdmin,
      setResponse: state.setResponse,
      sendEmail: state.sendEmail,
    }
  ), shallow);

  const [usernameRecord, setUsernameRecord] = useState<string>(
    isAdmin ? selectedUsername : username,
  );
  const [disabled, setDisabled] = useState(true);
  const [studentCSE, setStudentCSE] = useState('');
  const [courseRecord, setCourseRecord] = useState<string|null>(null);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    switch (event.target.name) {
      case 'la_username':
        if (isAdmin) {
          setUsernameRecord(event.target.value);
        }
        break;
      case 'student_cse_login':
        setStudentCSE(event.target.value);
        break;
      case 'course':
        setCourseRecord(event.target.value);
        break;
      default:
        alert(`${event.target.name} is an invalid ID`);
        break;
    }
    const shouldBeDisabled = course === 'choose'
      || studentCSE.trim().length === 0
      || usernameRecord.trim().length === 0;
    if (disabled !== shouldBeDisabled) {
      setDisabled(shouldBeDisabled);
    }
  }, [
    course,
    setCourseRecord,
    disabled,
    isAdmin,
    studentCSE,
    setStudentCSE,
    usernameRecord,
    setUsernameRecord,
  ]);

  const handleSubmit = useCallback(() => {
    if (!isAdmin && name === null) {
      setResponse({
        class: 'danger',
        content: 'Please set your name before submitting feedback (See the LA Settings)',
      });
      return;
    }

    if (studentCSE && studentCSE.trim().length > 0 && course && course.trim().length > 0) {
      setDisabled(true);
      sendEmail(studentCSE);
    } else {
      setResponse({
        class: 'danger',
        content: studentCSE && studentCSE.trim().length > 0
          ? 'Invalid course'
          : 'Invalid student',
      });
    }
  }, [isAdmin, name, studentCSE, course, setResponse, sendEmail]);

  return (
    <>
      {isAdmin
        ? (
          <>
            <h4 style={{ marginLeft: 0, marginTop: 45 }}>LA Feedback Interface (Admin)</h4>
            <p style={{ marginLeft: 0 }}>
              Record interactions on behalf of an LA
            </p>
          </>
        )
        : (
          <>
            <h4 style={{ marginLeft: 0, marginTop: 45 }}>LA Feedback Interface</h4>
            <p style={{ marginLeft: 0 }}>
              This web interface allows LAs to receive anonymous feedback on
              their performance from students. Select the course you worked with and enter
              the Student&apos;s CSE username
            </p>
          </>
        )}

      <div className="col-md-6">
        <form>
          <div className="form-group row">
            <label htmlFor="la_username" className="col-sm-4 col-form-label">
              LA CSE Username
            </label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                name="la_username"
                id="la_username"
                value={isAdmin ? selectedUsername : username}
                onChange={handleChange}
                disabled={!isAdmin}
              />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="course" className="col-sm-4 col-form-label">
              Course
            </label>
            <div className="col-sm-8">
              <select
                className="form-control"
                name="course"
                id="course"
                placeholder="Course"
                onChange={handleChange}
              >
                <option
                  value="choose"
                  selected={courseRecord !== null && !COURSES.includes(courseRecord)}
                >
                  (choose)
                </option>
                {COURSES.map((c) => (
                  <option value={c} selected={c === (courseRecord ?? course)}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="student_cse_login" className="col-sm-4 col-form-label">
              Student CSE
            </label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                name="student_cse_login"
                id="student_cse_login"
                placeholder="Student CSE Login"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group row">
            <div className="col-sm-9">
              <button
                id="submitButton"
                type="button"
                className="btn btn-primary active"
                value="Submit"
                onClick={handleSubmit}
                disabled={disabled}
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FeedbackForm;
