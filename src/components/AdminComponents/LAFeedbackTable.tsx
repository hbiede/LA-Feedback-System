/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

import shallow from 'zustand/shallow';

import SentimentText from 'components/AdminComponents/SentimentText';

import Redux, { AppReduxState } from 'redux/modules';
import { DEFAULT_COURSE_NAME } from 'redux/modules/Types';

import LASummaryTable from 'components/AdminComponents/LASummaryTable';
import LADetailTable from 'components/AdminComponents/LADetailTable';
import FeedbackTimeText from 'components/AdminComponents/FeedbackTimeText';
import OutstandingFeedbackText from 'components/AdminComponents/OutstandingFeedbackText';

type LA = {
  username: string;
  course?: string | null;
  name?: string;
};

/**
 * The main page for admins
 */
const LAFeedbackTable = () => {
  const {
    interactions,
    getInteractions,
    setInteractions,
    getRatings,
    selectedUsername,
    setSelectedUsername,
    name,
    setName,
    courses,
    course,
    setCourse,
    setResponse,
  } = Redux(
    (state: AppReduxState) => ({
      interactions: state.interactions,
      getInteractions: state.getInteractions,
      setInteractions: state.setInteractions,
      getRatings: state.getRatings,
      selectedUsername: state.selectedUsername,
      setSelectedUsername: state.setSelectedUsername,
      name: state.name,
      setName: state.setName,
      courses: state.courses,
      course: state.course,
      setCourse: state.setCourse,
      setResponse: state.setResponse,
    }),
    shallow
  );

  const [selectedLA, setSelectedLA] = useState<LA | null>(null);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string | null>(name);
  const [courseRecord, setCourseRecord] = useState<string | null>(
    course === DEFAULT_COURSE_NAME ? null : course
  );

  const showLA = useCallback(
    (la: LA) => {
      if (
        la &&
        (
          interactions.ratings.find(
            (rating) => rating.username === la.username
          ) ?? { fCount: 0 }
        ).fCount > 0
      ) {
        setSelectedLA(la);
        setSelectedUsername(la);
        setNewName(la.name ?? la.username);
        setCourseRecord(la.course ?? null);
      } else {
        setResponse({
          class: 'danger',
          content: `${la.name ?? la.username} has no recorded feedback`,
        });
      }
    },
    [interactions.ratings, setSelectedUsername, setResponse]
  );

  useEffect(() => {
    setInterval(() => getInteractions(), 900000); // Update every 15 minutes
    if (selectedUsername !== null && selectedUsername.trim().length > 0) {
      getRatings();
      showLA(
        interactions.ratings.filter((la) => la.username === selectedUsername)[0]
      );
    }
    // No Deps == componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLA(null);
    setCourseRecord(null);
  }, [setSelectedLA, setCourseRecord]);

  const setEditing = useCallback(() => {
    setEditingName(true);
    setNewName(selectedLA?.name || '');
  }, [selectedLA, setNewName, setEditingName]);

  const saveEditing = useCallback(() => {
    setEditingName(false);
    if (selectedLA !== null && newName !== null) {
      const trimmedName = newName.trim();
      setSelectedLA({
        ...selectedLA,
        name: trimmedName,
        course: courseRecord,
      });
      const matchingLA = interactions.ratings.findIndex(
        (la) => la.username === selectedLA.username
      );
      let newLAEntry = interactions.ratings[matchingLA];
      newLAEntry = {
        ...newLAEntry,
        name: trimmedName,
        course: courseRecord ?? newLAEntry.course,
      };
      setInteractions({
        ...interactions,
        ratings: [
          ...interactions.ratings.slice(0, matchingLA),
          newLAEntry,
          ...interactions.ratings.slice(matchingLA + 1),
        ],
      });

      setName({ name: trimmedName });
      if (courseRecord !== null && courseRecord !== 'choose') {
        setCourse({ course: courseRecord });
      }
    }
  }, [
    selectedLA,
    newName,
    courseRecord,
    interactions,
    setInteractions,
    setName,
    setCourse,
  ]);

  const changeName = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setNewName(event.target.value);
    },
    [setNewName]
  );

  if (interactions.ratings.length === 0) {
    return <h6>No feedback recorded. Go help students!!</h6>;
  }

  if (selectedLA === null) {
    return (
      <>
        <LASummaryTable showLA={showLA} />
        <SentimentText />
        <OutstandingFeedbackText />
        <FeedbackTimeText />
      </>
    );
  }

  return (
    <>
      <Form.Row>
        <InputGroup style={{ marginTop: 10 }} className="mb-3">
          <Button variant="dark" type="button" onClick={clearSelection}>
            Back
          </Button>

          <FormControl
            style={{ marginLeft: 10 }}
            type="text"
            placeholder="LA's Name"
            aria-label="LA's Name"
            aria-describedby="LA's Name"
            value={newName || ''}
            onChange={changeName}
            disabled={!editingName}
          />
          {editingName ? (
            <>
              <DropdownButton
                as={InputGroup.Append}
                variant="outline-secondary"
                id="course-dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                title={courseRecord}
              >
                {courses.map((c) => (
                  <Dropdown.Item
                    type="button"
                    value={c}
                    onClick={() => setCourseRecord(c)}
                  >
                    {c}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
              <Button
                variant="outline-secondary"
                type="submit"
                onClick={saveEditing}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <InputGroup.Text>{courseRecord}</InputGroup.Text>
              <Button
                variant="outline-secondary"
                type="button"
                onClick={setEditing}
              >
                Edit
              </Button>
            </>
          )}
        </InputGroup>
      </Form.Row>
      <LADetailTable />
    </>
  );
};

LAFeedbackTable.defaultProps = {
  style: {},
};

export default LAFeedbackTable;
