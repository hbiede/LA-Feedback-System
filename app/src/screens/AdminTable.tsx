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

import {
  COURSES, InteractionRecord, InteractionSummary, RatingRecord,
} from '../types';

import ServiceInterface from '../statics/ServiceInterface';
import FeedbackTimeText from '../components/FeedbackTimeText';
import LATable from '../components/LATable';
import SummaryTable from '../components/SummaryTable';

type Props = {
  style?: CSSProperties;
  username: string;
};

type LA = {
  username: string;
  name?: string;
  course?: string|null;
};

export default function AdminTable(props: Props) {
  const [interactions, setInteractions] = useState<InteractionSummary>({ ratings: [], time: -1 });
  const [selectedLA, setSelectedLA] = useState<LA | null>(null);
  const [ratings, setRatings] = useState<RatingRecord[]>([]);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string | null>(null);
  const [course, setCourse] = useState<string|null>(null);

  const { username, style } = props;

  useEffect(() => {
    ServiceInterface.getInteractions(username).then((ints) => setInteractions(ints));
    // No Deps == componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showLA = useCallback((la: LA) => {
    ServiceInterface.getRatings(username, la.username).then((newRatings) => {
      setRatings(newRatings);
      const modifiedLA = la;
      setNewName(modifiedLA.name ?? modifiedLA.username);
      ServiceInterface.courseREST(la.username).then((laCourse) => {
        modifiedLA.course = laCourse;
        setSelectedLA(modifiedLA);
        setCourse(laCourse);
      });
    });
  }, [setSelectedLA, username, setRatings]);

  const clearSelection = useCallback(() => {
    setSelectedLA(null);
    setRatings([]);
    setCourse(null);
  }, [setSelectedLA, setRatings]);

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
        course,
      });
      const matchingLA = interactions.ratings
        .findIndex((la) => la.username === selectedLA.username);
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

      ServiceInterface.nameREST(selectedLA.username, trimmedName);
    }
  }, [interactions, selectedLA, setSelectedLA, setEditingName, newName]);

  const changeName = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewName(event.target.value);
  }, [setNewName]);

  const handleCourseSelect = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setCourse(event.currentTarget.value);
    }, [],
  );

  if (interactions.ratings.length === 0) {
    return (
      <h6>
        No feedback recorded. Go help students!!
      </h6>
    );
  }

  if (selectedLA === null) {
    return (
      <div style={style} className="col-md-10">
        <SummaryTable showLA={showLA} interactions={interactions} />
        <FeedbackTimeText interactions={interactions} />
      </div>
    );
  }

  return (
    <div style={style} className="col-md-10">
      <div className="form-row">
        <button className="btn btn-dark" type="button" onClick={clearSelection}>Back</button>
        <div style={{ marginTop: 10 }} className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="LA's Name"
            aria-label="LA's Name"
            aria-describedby="basic-addon2"
            value={newName || ''}
            onChange={changeName}
            disabled={!editingName}
          />
          <div className="input-group-append">
            {editingName
              ? (
                <>
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {course}
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
                  <button className="btn btn-outline-secondary" type="button" onClick={saveEditing}>
                    Save
                  </button>
                </>
              )
              : (
                <>
                  <span className="input-group-text">{course}</span>
                  <button className="btn btn-outline-secondary" type="button" onClick={setEditing}>
                    Edit
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
      <LATable ratings={ratings} />
    </div>
  );
}
