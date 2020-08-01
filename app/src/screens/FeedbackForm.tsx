/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

/* eslint-disable no-alert */
import React, {
  ChangeEvent, useCallback, useState,
} from 'react';

import { Transition } from 'react-transition-group';

import ServiceInterface from '../statics/ServiceInterface';
import { COURSES } from '../statics/Types';

type Props = {
  defaultCourse: string|null;
  isAdmin: boolean;
  name: string|null;
  username: string;
};

type Response = {
  class: string;
  content: string;
}

const TRANSITION_TIME = 300;
const DEFAULT_STYLES = {
  transition: `opacity ${TRANSITION_TIME}ms ease-in-out`,
  opacity: 0,
};

const TRANSITION_STYLE = {
  entering:  { opacity: 1 },
  entered:   { opacity: 1 },
  exiting:   { opacity: 0 },
  exited:    { opacity: 0 },
  unmounted: { opacity: 0 },
};

const FeedbackForm = ({
  defaultCourse, isAdmin, name, username: usernameProp,
}: Props) => {
  // constructor(props: Readonly<Props>) {
  //   super(props);
  //   const { defaultCourse, username } = this.props;
  //   this.state = {
  //     course: defaultCourse ?? '',
  //     disabled: false,
  //     studentCSE: '',
  //     username,
  //   };
  // }

  const [course, setCourse] = useState(defaultCourse ?? '');
  const [disabled, setDisabled] = useState(true);
  const [displayingResponse, setDisplayingResponse] = useState(false);
  const [responseContent, setResponseContent] = useState<Response|null>(null);
  const [studentCSE, setStudentCSE] = useState('');
  const [username, setUsername] = useState(usernameProp);

  const resetAlert = useCallback(() => {
    setTimeout(() => {
      setDisplayingResponse(false);
    }, 10000);
  }, [setDisplayingResponse]);

  const changeResponse = useCallback((newContent: Response) => {
    setResponseContent(newContent);
    resetAlert();
  }, [resetAlert, setResponseContent]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setResponseContent(null);
    switch (event.target.name) {
      case 'la_username':
        if (isAdmin) {
          setUsername(event.target.value);
        }
        break;
      case 'student_cse_login':
        setStudentCSE(event.target.value);
        break;
      case 'course':
        setCourse(event.target.value);
        break;
      default:
        alert(`${event.target.name} is an invalid ID`);
        break;
    }
    const shouldBeDisabled = course === 'choose'
      || studentCSE.trim().length === 0
      || username.trim().length === 0;
    if (disabled !== shouldBeDisabled) {
      setDisabled(shouldBeDisabled);
    }
  }, [
    course,
    setCourse,
    disabled,
    isAdmin,
    studentCSE,
    setStudentCSE,
    username,
    setUsername,
    setResponseContent,
  ]);

  const handleSubmit = useCallback(() => {
    if (name === null) {
      changeResponse({
        class: 'alert-danger',
        content: 'Please set your name before submitting feedback (See the LA Settings)',
      });
      return;
    }

    if (studentCSE && studentCSE.trim().length > 0 && course && course.trim().length > 0) {
      setDisabled(true);
      ServiceInterface.sendEmail(studentCSE, username, course).then((response) => {
        if (response === '0' || response === 0) {
          changeResponse({
            class: 'alert-success',
            content: 'Interaction recorded',
          });
        } else {
          changeResponse({
            class: 'alert-danger',
            content: `Failed to Send Message. Please Try Again. (Error Code ${response})`,
          });
        }
        setDisabled(false);
      }).catch((error) => {
        changeResponse({
          class: 'alert-danger',
          content: `Failed to Send Message. Please Try Again. (Error: ${error})`,
        });
        setDisabled(false);
      });
    } else {
      changeResponse({
        class: 'alert-danger',
        content: studentCSE && studentCSE.trim().length > 0
          ? 'Invalid course'
          : 'Invalid student',
      });
    }
  }, [changeResponse, course, name, studentCSE, username]);

  const hasResponse = displayingResponse
    && responseContent !== null
    && responseContent.content.trim().length !== 0;
  return (
    <>
      <Transition in={hasResponse} timeout={TRANSITION_TIME}>
        {(state) => (
          <div
            className={['alert', responseContent?.class].join(' ')}
            id="responseDiv"
            style={{
              ...DEFAULT_STYLES,
              ...TRANSITION_STYLE[state],
            }}
          >
            {responseContent?.content}
          </div>
        )}
      </Transition>
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
              value={username}
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
                selected={defaultCourse !== null && !COURSES.includes(defaultCourse)}
              >
                (choose)
              </option>
              {COURSES.map((c) => (
                <option value={c} selected={c === defaultCourse}>{c}</option>
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
    </>
  );
};

export default FeedbackForm;
