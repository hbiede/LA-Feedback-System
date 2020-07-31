/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { ChangeEvent, useCallback, useState } from 'react';

import ServiceInterface from '../statics/ServiceInterface';

import { COURSES } from '../types';

type Props = {
  closeModal: () => void;
  isAdmin: boolean;
  name: string|null;
  setName: (newName: string) => void;
  username: string;
};

const SettingsForm = ({
  closeModal,
  isAdmin,
  name,
  setName,
  username,
} : Props) => {
  const [selectedUsername, setSelectedUsername] = useState(username);
  const [hasSelectedUsername, setHasSelectedUsername] = useState(!isAdmin);
  const [nameRecord, setNameRecord] = useState<string>(name || '');
  const [disabled, setDisabled] = useState<boolean>(
    !isAdmin || name === null || name.trim().length === 0,
  );
  const [course, setCourse] = useState<string|null>(null);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (event.target.name === 'selected_username') {
      setSelectedUsername(event.target.value);
    } else if (event.target.name === 'la_name') {
      const changedName = event.target.value;
      setNameRecord(changedName);

      const shouldBeDisabled = (changedName === null || changedName.trim().length === 0)
          && (course === null || course.trim().length === 0);
      if (disabled !== shouldBeDisabled) {
        setDisabled(shouldBeDisabled);
      }
    } else if (event.target.name === 'course') {
      const isChoose = event.target.value === 'choose';
      setCourse(isChoose ? null : event.target.value);
      setDisabled(isChoose);
    } else {
      console.warn(`${event.target.name} is an invalid ID`);
    }
  }, [course, disabled, setDisabled, setNameRecord, setSelectedUsername]);

  const handleSubmit = useCallback(() => {
    if (hasSelectedUsername) {
      setDisabled(true);

      const trimmedName = nameRecord.trim();
      ServiceInterface.nameREST(selectedUsername, trimmedName);
      ServiceInterface.courseREST(selectedUsername, course);
      if (!isAdmin) {
        setName(trimmedName);
        closeModal();
      }
    } else {
      setHasSelectedUsername(true);
      ServiceInterface.nameREST(selectedUsername).then((laName) => setNameRecord(laName));
      ServiceInterface.courseREST(selectedUsername).then((laCourse) => setCourse(laCourse));
    }
  }, [
    isAdmin,
    course,
    nameRecord,
    setName,
    setDisabled,
    closeModal,
    selectedUsername,
    hasSelectedUsername,
    setHasSelectedUsername,
  ]);

  const changeLA = useCallback(() => {
    setHasSelectedUsername(false);
    setDisabled(false);
  }, [setHasSelectedUsername]);

  return (
    <>
      <h2>LA Settings</h2>
      <form>
        {hasSelectedUsername
          ? (
            <>
              <div className="form-group row">
                <label htmlFor="la_name" className="col-sm-4 col-form-label">
                  Your Name
                </label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    className="form-control"
                    name="la_name"
                    id="la_name"
                    value={nameRecord || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="course" className="col-sm-4 col-form-label">
                  Default Course
                </label>
                <div className="col-sm-8">
                  <select
                    className="form-control"
                    name="course"
                    id="course"
                    placeholder="Course"
                    onChange={handleChange}
                  >
                    <option value="0">(choose)</option>
                    {COURSES.map((c) => <option value={c} selected={course === c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {
                isAdmin && (
                <div className="form-group row">
                  <div className="col-sm-9">
                    <button
                      id="submitButton"
                      type="button"
                      className="btn btn-primary active"
                      value="Change LA"
                      onClick={changeLA}
                    >
                      Change LA
                    </button>
                  </div>
                </div>
                )
              }
            </>
          )
          : (
            <div className="form-group row">
              <label htmlFor="selected_username" className="col-sm-4 col-form-label">
                Username to Modify
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  name="selected_username"
                  id="selected_username"
                  value={selectedUsername}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
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

export default SettingsForm;
