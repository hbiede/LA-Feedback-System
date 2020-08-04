/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { ChangeEvent, useCallback, useState } from 'react';
import shallow from 'zustand/shallow';

import { COURSES } from 'statics/Types';

import Redux from 'redux/modules';

type Props = {
  closeModal: () => void;
};

const SettingsForm = ({ closeModal }: Props) => {
  const {
    selectedUsername,
    setSelectedUsername,
    name,
    setName,
    course,
    setCourse,
    isAdmin,
    setResponse,
  } = Redux(
    (state) => ({
      selectedUsername: state.selectedUsername,
      setSelectedUsername: state.setSelectedUsername,
      name: state.name,
      setName: state.setName,
      course: state.course,
      setCourse: state.setCourse,
      isAdmin: state.isAdmin,
      setResponse: state.setResponse,
    }),
    shallow
  );

  const [selectedUsernameRecord, setSelectedUsernameRecord] = useState<string>(
    selectedUsername
  );
  const [nameRecord, setNameRecord] = useState<string>(name);
  const [courseRecord, setCourseRecord] = useState<string | null>(course);
  const [hasSelectedUsername, setHasSelectedUsername] = useState<boolean>(
    !isAdmin ||
      (selectedUsername !== null && selectedUsername.trim().length > 0)
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (event.target.name === 'selected_username') {
        setSelectedUsernameRecord(event.target.value);
      } else if (event.target.name === 'la_name') {
        const changedName = event.target.value;
        setNameRecord(changedName);
      } else if (event.target.name === 'course') {
        const isChoose = event.target.value === 'choose';
        setCourseRecord(isChoose ? null : event.target.value);
      } else {
        setResponse({
          class: 'danger',
          content: `${event.target.name} is an invalid ID`,
        });
      }
    },
    [setResponse]
  );

  const handleSubmit = useCallback(() => {
    if (hasSelectedUsername) {
      const trimmedName = nameRecord.trim();
      setName({ name: trimmedName });
      if (courseRecord !== null && courseRecord !== 'choose') {
        setCourse({ course: courseRecord });
      }
      if (!isAdmin) {
        closeModal();
      }
    } else if (isAdmin) {
      setSelectedUsername({ username: selectedUsernameRecord });
      setHasSelectedUsername(true);
    }
  }, [
    hasSelectedUsername,
    nameRecord,
    setName,
    setCourse,
    courseRecord,
    isAdmin,
    setSelectedUsername,
    selectedUsernameRecord,
    closeModal,
  ]);

  const changeLA = useCallback(() => {
    setSelectedUsername({ username: '' });
    setHasSelectedUsername(false);
  }, [setSelectedUsername]);

  const disabled =
    (hasSelectedUsername && (!nameRecord || nameRecord.trim().length === 0)) ||
    (!hasSelectedUsername &&
      isAdmin &&
      (!selectedUsernameRecord || selectedUsernameRecord.trim().length === 0));

  return (
    <>
      <h2>
        {`LA Settings${
          isAdmin
            ? ` (${hasSelectedUsername ? selectedUsername : 'Admin Panel'})`
            : ''
        }`}
      </h2>
      <form>
        {hasSelectedUsername ? (
          <>
            <div className="form-group row">
              <label htmlFor="la_name" className="col-sm-4 col-form-label">
                {isAdmin ? "LA's Name" : 'Your Name'}
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  name="la_name"
                  id="la_name"
                  defaultValue={name}
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
                  defaultValue={course}
                >
                  <option value="0">(choose)</option>
                  {COURSES.map((c) => (
                    <option value={c} selected={course === c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {isAdmin && (
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
            )}
          </>
        ) : (
          <div className="form-group row">
            <label
              htmlFor="selected_username"
              className="col-sm-4 col-form-label"
            >
              Username to Modify
            </label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                name="selected_username"
                id="selected_username"
                value={
                  selectedUsernameRecord.length > 0
                    ? selectedUsernameRecord
                    : undefined
                }
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
