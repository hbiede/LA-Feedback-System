/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, {
  ChangeEvent,
  CSSProperties,
  useCallback,
  useEffect,
  useState,
} from 'react';
import shallow from 'zustand/shallow';

import { COURSES } from 'statics/Types';

import FeedbackTimeText from 'components/FeedbackTimeText';
import LATable from 'components/LATable';
import SummaryTable from 'components/SummaryTable';

import Redux from 'redux/modules';

type Props = {
  style?: CSSProperties;
};

type LA = {
  username: string;
  name?: string;
  course?: string | null;
};

export default function AdminTable(props: Props) {
  const {
    interactions,
    getInteractions,
    setInteractions,
    getRatings,
    selectedUsername,
    setSelectedUsername,
    name,
    setName,
    course,
    setCourse,
  } = Redux(
    (state) => ({
      interactions: state.interactions,
      getInteractions: state.getInteractions,
      setInteractions: state.setInteractions,
      getRatings: state.getRatings,
      selectedUsername: state.selectedUsername,
      setSelectedUsername: state.setSelectedUsername,
      name: state.name,
      setName: state.setName,
      course: state.course,
      setCourse: state.setCourse,
    }),
    shallow
  );

  const [selectedLA, setSelectedLA] = useState<LA | null>(null);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string | null>(name);
  const [courseRecord, setCourseRecord] = useState<string | null>(course);

  const { style } = props;

  const showLA = useCallback(
    (la: LA) => {
      setSelectedLA(la);
      setSelectedUsername(la);
      setNewName(la.name ?? la.username);
      setCourseRecord(la.course ?? null);
    },
    [setSelectedUsername]
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

  const handleCourseSelect = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setCourseRecord(event.currentTarget.value);
    },
    [setCourseRecord]
  );

  if (interactions.ratings.length === 0) {
    return <h6>No feedback recorded. Go help students!!</h6>;
  }

  if (selectedLA === null) {
    return (
      <div style={style} className="col-md-10">
        <SummaryTable showLA={showLA} />
        <FeedbackTimeText />
      </div>
    );
  }

  return (
    <div style={style} className="col-md-10">
      <div className="form-row">
        <div style={{ marginTop: 10 }} className="input-group mb-3">
          <button
            className="btn btn-dark"
            type="button"
            onClick={clearSelection}
          >
            Back
          </button>
          <input
            style={{ marginLeft: 10 }}
            type="text"
            className="form-control"
            placeholder="LA's Name"
            aria-label="LA's Name"
            aria-describedby="LA's Name"
            value={newName || ''}
            onChange={changeName}
            disabled={!editingName}
          />
          <div className="input-group-append">
            {editingName ? (
              <>
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {courseRecord}
                </button>
                <div className="dropdown-menu">
                  {COURSES.map((c) => (
                    <button
                      type="button"
                      className="dropdown-item"
                      value={c}
                      onClick={handleCourseSelect}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={saveEditing}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="input-group-text">{courseRecord}</span>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={setEditing}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <LATable />
    </div>
  );
}
