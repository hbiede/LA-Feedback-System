import React, {
  ChangeEvent, Component, MutableRefObject,
} from 'react';

import Services from '../services/backgroundService';

const COURSES = ['101', '155E', '155N', '156'];

type Props = {
  username: string;
  responseDivRef?: MutableRefObject<HTMLDivElement | null>;
};

type State = {
  course: string;
  disabled: boolean;
  studentCSE: string;
};

class FeedbackForm extends Component<Props, State> {
  constructor(props: Readonly<any>) {
    super(props);
    this.state = {
      course: '',
      disabled: false,
      studentCSE: '',
    };
  }

  handleChange = (event: ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    switch (event.target.name) {
      case 'student_cse_login':
        this.setState({ studentCSE: event.target.value });
        break;
      case 'course':
        this.setState({ course: event.target.value });
        break;
      default:
        break;
    }
  };

  handleSubmit = async () => {
    const {
      studentCSE,
      course,
    } = this.state;
    const { username } = this.props;
    this.setState({ disabled: true });
    const errorFree = Services.isLA(username);
    let status = null;
    if (errorFree) {
      await Services.sendEmail(studentCSE, username, course).then((response) => {
        status = response;
      });
    }

    const { responseDivRef } = this.props;
    if (responseDivRef?.current) {
      const alertType = errorFree && status === 0 ? 'success' : 'danger';
      let alert = `<div class="alert alert-${alertType}" role="alert">`;
      if (errorFree) {
        alert += status === 0
          ? 'Message Sent!'
          : `Failed to Send Message. Please Try Again. (Error Code ${status})`;
      } else {
        alert += 'Invalid Login';
      }
      alert += '</div>';

      responseDivRef.current.innerHTML = alert;
    }
    setTimeout(() => this.setState({ disabled: false }), 1000);
  };

  render() {
    const { disabled } = this.state;
    const { username } = this.props;
    return (
      <form>
        <div className="form-group row">
          <label htmlFor="la_username" className="col-sm-4 col-form-label">
            Student CSE
          </label>
          <div className="col-sm-8">
            <input
              type="text"
              className="form-control"
              name="la_username"
              id="la_username"
              value={username}
              disabled
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
              {COURSES.map((course) => <option value={course}>{course}</option>)}
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
