/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

/* eslint-disable no-alert */
import React, {
  ChangeEvent, Component, MutableRefObject,
} from 'react';

import Services from '../services/backgroundService';

import { COURSES } from '../types';

type Props = {
  defaultCourse: string|null;
  isAdmin: boolean;
  name: string|null;
  responseDivRef?: MutableRefObject<HTMLDivElement | null>;
  username: string;
};

type State = {
  course: string;
  disabled: boolean;
  studentCSE: string;
  username: string;
};

class FeedbackForm extends Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    const { defaultCourse, username } = this.props;
    this.state = {
      course: defaultCourse ?? '',
      disabled: false,
      studentCSE: '',
      username,
    };
  }

  resetAlert = () => {
    const { responseDivRef } = this.props;
    setTimeout(() => {
      if (responseDivRef?.current) {
        responseDivRef.current.innerHTML = '';
      }
    }, 10000);
  }

  handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { isAdmin, responseDivRef } = this.props;
    if (responseDivRef?.current) {
      responseDivRef.current.innerHTML = '';
    }
    switch (event.target.name) {
      case 'la_username':
        if (isAdmin) {
          this.setState({ username: event.target.value });
        }
        break;
      case 'student_cse_login':
        this.setState({ studentCSE: event.target.value });
        break;
      case 'course':
        if (event.target.value !== 'choose') {
          this.setState({ course: event.target.value.toLowerCase().trim() });
        }
        break;
      default:
        console.warn(`${event.target.name} is an invalid ID`);
        break;
    }
  };

  handleSubmit = () => {
    const {
      studentCSE,
      course,
    } = this.state;
    const { name, responseDivRef } = this.props;
    if (name === null) {
      const error = 'Please set your name before submitting feedback (See the LA Settings)';
      if (responseDivRef?.current) {
        const alertType = 'danger';
        let alert = `<div class="alert alert-${alertType}" role="alert">`;
        alert += error;
        alert += '</div>';

        responseDivRef.current.innerHTML = alert;
        this.resetAlert();
      } else {
        alert(error);
      }
      return;
    }

    if (studentCSE && studentCSE.trim().length > 0 && course && course.trim().length > 0) {
      const { username } = this.state;
      this.setState({ disabled: true });
      Services.sendEmail(studentCSE, username, course).then((response) => {
        const error = response === '0' || response === 0
          ? 'Interaction recorded'
          : `Failed to Send Message. Please Try Again. (Error Code ${response})`;
        if (responseDivRef?.current) {
          const alertType = response === '0' || response === 0 ? 'success' : 'danger';
          let alert = `<div class="alert alert-${alertType}" role="alert">`;
          alert += error;
          alert += '</div>';

          responseDivRef.current.innerHTML = alert;
          this.resetAlert();
        } else {
          alert(error);
        }
        this.setState({ disabled: false });
      }).catch((error) => {
        const errorMsg = `Failed to Send Message. Please Try Again. (Error: ${error})`;
        if (responseDivRef?.current) {
          let alert = '<div class="alert alert-danger" role="alert">';
          alert += errorMsg;
          alert += '</div>';

          responseDivRef.current.innerHTML = alert;
          this.resetAlert();
        } else {
          alert(errorMsg);
        }
        this.setState({ disabled: false });
      });
    } else {
      const error = studentCSE && studentCSE.trim().length > 0
        ? 'Invalid course'
        : 'Invalid student';
      if (responseDivRef?.current) {
        let alert = '<div class="alert alert-danger" role="alert">';
        alert += error;
        alert += '</div>';

        responseDivRef.current.innerHTML = alert;
        this.resetAlert();
      } else {
        alert(error);
      }
    }
  };

  render() {
    const { disabled, username } = this.state;
    const { defaultCourse, isAdmin } = this.props;
    // TODO: Allow username to be carried to admin version of LA Settings (needs Redux)
    return (
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
              onChange={this.handleChange}
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
              onChange={this.handleChange}
            >
              <option
                value="choose"
                selected={defaultCourse !== null && !COURSES.includes(defaultCourse)}
              >
                (choose)
              </option>
              {COURSES.map((course) => (
                <option value={course} selected={course === defaultCourse}>{course}</option>
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
              onChange={this.handleChange}
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
              onClick={this.handleSubmit}
              disabled={disabled}
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    );
  }
}

export default FeedbackForm;
