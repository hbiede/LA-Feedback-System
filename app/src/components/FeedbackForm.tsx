import React, {
  ChangeEvent, Component, MutableRefObject,
} from 'react';

import Services from '../services/backgroundService';

type Props = {
  responseDivRef?: MutableRefObject<HTMLDivElement | null>;
};

type State = {
  cseLogin: string;
  password: string;
  studentCSE: string;
  disabled: boolean;
};

class FeedbackForm extends Component<Props, State> {
  constructor(props: Readonly<any>) {
    super(props);
    this.state = {
      cseLogin: '',
      password: '',
      studentCSE: '',
      disabled: false,
    };
  }

  handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    switch (event.target.name) {
      case 'cse_login':
        this.setState({ cseLogin: event.target.value });
        break;
      case 'cse_password':
        this.setState({ password: event.target.value });
        break;
      case 'student_cse_login':
        this.setState({ studentCSE: event.target.value });
        break;
      default:
        break;
    }
  };

  handleSubmit = async () => {
    const { cseLogin, password, studentCSE } = this.state;
    this.setState({ disabled: true });
    const errorFree = Services.authenticate(cseLogin, password);
    let status = null;
    if (errorFree) {
      await Services.sendEmail(studentCSE, cseLogin).then((response) => {
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
    return (
      <form>
        <div className="form-group row">
          <label htmlFor="cse_login" className="col-sm-4 col-form-label">
            CSE Username
          </label>
          <div className="col-sm-8">
            <input
              type="text"
              name="cse_login"
              className="form-control"
              placeholder="CSE Login"
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="cse_password" className="col-sm-4 col-form-label">
            Password
          </label>
          <div className="col-sm-8">
            <input
              type="password"
              className="form-control"
              name="cse_password"
              id="cse_password"
              placeholder="CSE Password"
              onChange={this.handleChange}
            />
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
