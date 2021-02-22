import React, { ChangeEvent, useCallback, useState } from 'react';

import ReactMarkdown from 'react-markdown';

import Alert from 'react-bootstrap/Alert';
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import FormGroup from 'react-bootstrap/FormGroup';

import Button from 'react-bootstrap/Button';

import shallow from 'zustand/shallow';

import { ALERT_CLASSES, ResponseClass } from 'redux/modules/Types';

import Redux, { AppReduxState } from 'redux/modules';

const ALL_COURSE_OPTION = 'all';

const CONTENT_ID = 'AnnouncementContentEditorTextArea';

const COURSE_ID = 'AnnouncementCourseSelectionDropdown';
const COURSE_LABEL = 'Course';

const CLASS_ID = 'AnnouncementAlertClassSelectionDropdown';
const CLASS_LABEL = 'Alert Type';

/**
 * A screen on which an admin can create announcements viewable by the LAs
 */
const AnnouncementEditor = () => {
  const { clearAnnouncements, courses, setAnnouncements } = Redux(
    (state: AppReduxState) => ({
      clearAnnouncements: state.clearAnnouncements,
      courses: state.courses,
      setAnnouncements: state.setAnnouncements,
    }),
    shallow
  );

  const [currentBody, setCurrentBody] = useState<string>('');
  const [courseRecord, setCourseRecord] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<ResponseClass | null>(null);
  const disabled = courseRecord === null || currentBody.trim().length === 0;
  const [heading, setHeading] = useState<string | null>(null);

  const handleChange = useCallback(
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setHeading(null);
      const { id, value } = event.target;
      switch (id) {
        case CONTENT_ID:
          setCurrentBody(value);
          break;
        case CLASS_ID:
          setAlertType(value === 'choose' ? null : (value as ResponseClass));
          break;
        case COURSE_ID:
          setCourseRecord(value === 'choose' ? null : value);
          break;
        default:
      }
    },
    [setHeading]
  );

  const handleSubmit = useCallback(() => {
    if (currentBody && alertType && courseRecord) {
      setAnnouncements({
        body: currentBody,
        class: alertType,
        course: courseRecord,
      }).then((responseCode) => {
        if (responseCode === 0) {
          setHeading('Announcement set!');
        } else {
          setHeading('Announcement server failure. Announcement not set.');
        }
      });
    } else {
      setHeading('Unable to send. Please fill out all values');
    }
  }, [alertType, courseRecord, currentBody, setAnnouncements]);

  return (
    <>
      {heading !== null && <h2>{heading}</h2>}
      <Collapse in={!disabled}>
        <Alert variant={alertType ?? 'info'} id="announcementPreview">
          <ReactMarkdown source={currentBody} />
        </Alert>
      </Collapse>

      <textarea id={CONTENT_ID} onChange={handleChange} value={currentBody} />
      <FormGroup as={Row} controlId={COURSE_ID}>
        <Form.Label className="col-sm-5">{COURSE_LABEL}</Form.Label>
        <div className="col-sm-7">
          <Form.Control
            as="select"
            role="combobox"
            placeholder={COURSE_LABEL}
            onChange={handleChange}
            required
            aria-required
            custom
            value={courseRecord ?? 'choose'}
          >
            <option
              value="choose"
              hidden
              aria-hidden
              selected={
                courseRecord !== null && !courses.includes(courseRecord)
              }
            >
              (choose)
            </option>
            <option
              value={ALL_COURSE_OPTION}
              selected={courseRecord === ALL_COURSE_OPTION}
              aria-selected={courseRecord === ALL_COURSE_OPTION}
            >
              {ALL_COURSE_OPTION}
            </option>
            {courses.map((c) => (
              <option
                value={c}
                selected={c === courseRecord}
                aria-selected={c === courseRecord}
              >
                {c}
              </option>
            ))}
          </Form.Control>
        </div>
      </FormGroup>
      <FormGroup as={Row} controlId={CLASS_ID}>
        <Form.Label className="col-sm-5">{CLASS_LABEL}</Form.Label>
        <div className="col-sm-7">
          <Form.Control
            as="select"
            role="combobox"
            placeholder={CLASS_LABEL}
            onChange={handleChange}
            required
            aria-required
            custom
            value={alertType ?? 'choose'}
          >
            <option
              value="choose"
              hidden
              aria-hidden
              selected={alertType !== null && !courses.includes(alertType)}
            >
              (choose)
            </option>
            {ALERT_CLASSES.map((c) => (
              <option
                value={c}
                selected={c === alertType}
                aria-selected={c === alertType}
              >
                {c}
              </option>
            ))}
          </Form.Control>
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
          <Button
            id="clearAnnouncementsButton"
            role="button"
            type="reset"
            variant="danger"
            value="Clear Announcements"
            onClick={clearAnnouncements}
            style={{ marginLeft: 10 }}
          >
            Clear Announcements
          </Button>
        </div>
      </FormGroup>
    </>
  );
};

export default AnnouncementEditor;
