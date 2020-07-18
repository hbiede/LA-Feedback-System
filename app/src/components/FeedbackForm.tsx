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

  handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { responseDivRef } = this.props;
    if (responseDivRef?.current) {
      responseDivRef.current.innerHTML = '';
    }
    switch (event.target.name) {
      case 'student_cse_login':
        this.setState({ studentCSE: event.target.value });
        break;
      case 'course':
        if (event.target.value !== 'choose') {
          this.setState({ course: event.target.value });
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
    const { responseDivRef } = this.props;
    if (studentCSE && studentCSE.trim().length > 0 && course && course.trim().length > 0) {
      const { username } = this.props;
      this.setState({ disabled: true });
      console.log(this.state);
      Services.sendEmail(studentCSE, username, course).then((response) => {
        if (responseDivRef?.current) {
          const alertType = response === '0' || response === 0 ? 'success' : 'danger';
          let alert = `<div class="alert alert-${alertType}" role="alert">`;
          alert += response === '0' || response === 0
            ? 'Interaction recorded'
            : `Failed to Send Message. Please Try Again. (Error Code ${response})`;
          alert += '</div>';

          responseDivRef.current.innerHTML = alert;
        }
        this.setState({ disabled: false });
      }).catch((error) => {
        if (responseDivRef?.current) {
          let alert = '<div class="alert alert-danger" role="alert">';
          alert += `Failed to Send Message. Please Try Again. (Error: ${error})`;
          alert += '</div>';

          responseDivRef.current.innerHTML = alert;
        }
        this.setState({ disabled: false });
      });
    } else if (responseDivRef?.current) {
      let alert = '<div class="alert alert-danger" role="alert">';
      alert += 'Invalid input';
      alert += '</div>';

      responseDivRef.current.innerHTML = alert;
    }
  };

  render() {
    const { disabled } = this.state;
    const { username } = this.props;
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
              <option value="choose">(choose)</option>
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
