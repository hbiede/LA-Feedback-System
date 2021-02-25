/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';

import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import shallow from 'zustand/shallow';

import Form from 'react-bootstrap/Form';

import { SORT_CHARS, SortConfig } from 'statics/Types';

import Redux, { AppReduxState } from 'redux/modules';
import PaginationButtons, {
  RATINGS_PER_PAGE,
} from 'components/PaginationButtons';
import { Student } from 'redux/modules/Types';

const STUDENT_TEXT_FIELD_GROUP_ID = 'student_text_field_grouping';
const STUDENT_TEXT_FIELD_ID = 'student_text_field';
const STUDENT_USERNAME_ID = 'student_username_column';
const STUDENT_NAME_ID = 'student_name_column';
const INTERACTION_COUNT_ID = 'interaction_count_column';

const getUsername = (s: Student) => s.username ?? s.canvas_username;
const getName = (s: Student) => s.name ?? getUsername(s);

const StudentTable = () => {
  const { addStudents, setResponse, students } = Redux(
    (state: AppReduxState) => ({
      addStudents: state.addStudents,
      setResponse: state.setResponse,
      students: state.students,
    }),
    shallow
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: STUDENT_USERNAME_ID,
    order: 1,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activePage, setActivePage] = useState(1);
  const [studentText, setStudentText] = useState('');

  const getData = useMemo(
    () =>
      students
        .filter((student) => {
          const trimmedTerm = searchTerm.trim().toLowerCase();
          const regexCompilation = new RegExp(trimmedTerm, 'i');
          const { username, name, canvas_username, course } = student;
          return (
            username?.toLowerCase().includes(trimmedTerm) ||
            (name && name.toLowerCase().includes(trimmedTerm)) ||
            (canvas_username &&
              canvas_username.toLowerCase().includes(trimmedTerm)) ||
            (course && course.toLowerCase().includes(trimmedTerm)) ||
            (username && regexCompilation.test(username)) ||
            (name && regexCompilation.test(name)) ||
            (canvas_username && regexCompilation.test(canvas_username)) ||
            (course && regexCompilation.test(course))
          );
        })
        .sort((a, b) => {
          let cmp = 0;
          switch (sortConfig.column) {
            case INTERACTION_COUNT_ID:
              if (a.interaction_count < b.interaction_count) {
                cmp = -1;
              } else if (a.interaction_count > b.interaction_count) {
                cmp = 1;
              }
              return sortConfig.order * cmp;
            case STUDENT_USERNAME_ID:
              return (
                sortConfig.order * getUsername(a).localeCompare(getUsername(b))
              );
            default:
              return sortConfig.order * getName(a).localeCompare(getName(b));
          }
        }),
    [searchTerm, sortConfig, students]
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setActivePage(1);
      setSearchTerm(event.currentTarget.value);
    },
    [setSearchTerm]
  );

  const clearSearch = useCallback(() => {
    if (searchTerm.length > 0) {
      setSearchTerm('');
      setActivePage(1);
    }
  }, [searchTerm, setSearchTerm]);

  const handleSortClick = useCallback(
    (event: React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>) => {
      setActivePage(1);
      const clickedHeader = event.currentTarget.id;
      const { column, order } = sortConfig;

      if (column === clickedHeader) {
        setSortConfig({
          column,
          order: order * -1,
        });
      } else {
        setSortConfig({
          column: clickedHeader,
          order: 1,
        });
      }
    },
    [sortConfig, setSortConfig]
  );

  const handleStudentTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newStudentText = event.currentTarget.value;
      if (studentText !== newStudentText) {
        setStudentText(newStudentText);
      }
    },
    [studentText]
  );

  const handleStudentSubmit = useCallback(() => {
    addStudents(studentText).then((response: number) => {
      if (response === 0) {
        setStudentText('');
        window.scrollTo(0, 0);
        setResponse({
          class: 'success',
          content: `Added ${studentText.split('\n').length} students`,
        });
      } else {
        setResponse({
          class: 'danger',
          content: `Error adding student (Error code: ${response})`,
        });
      }
    });
  }, [addStudents, studentText, setResponse]);

  const { column, order } = sortConfig;
  const clearableSearch = searchTerm.length > 0;
  const studentTextSubmitDisabled =
    studentText.length === 0 || !studentText.includes(';');
  return (
    <>
      <InputGroup className="mt-3 mb-4 col-7" style={{ paddingLeft: 0 }}>
        <FormControl
          placeholder=" Search"
          aria-label="Search"
          aria-describedby="search"
          onChange={handleSearchChange}
          value={searchTerm}
        />
        <InputGroup.Append>
          {
            clearableSearch ? (
              <Button
                id="search"
                onClick={clearSearch}
                variant="outline-secondary"
                style={{ cursor: 'default' }}
              >
                {'\u274C' /* X Emoji */}
              </Button>
            ) : (
              <InputGroup.Text id="search">&#x1F50D;</InputGroup.Text>
            ) /* Magnifying Glass */
          }
        </InputGroup.Append>
      </InputGroup>
      <Table hover style={{ width: '100%', cursor: 'default' }} role="table">
        <thead className="thead-dark">
          <tr>
            <th
              role="columnheader"
              id={STUDENT_USERNAME_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Username ${
                column === STUDENT_USERNAME_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th
              role="columnheader"
              id={STUDENT_NAME_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Name ${
                column === STUDENT_NAME_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th
              role="columnheader"
              id={INTERACTION_COUNT_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Interaction Count ${
                column === INTERACTION_COUNT_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
          </tr>
        </thead>
        <tbody>
          {getData
            .slice(
              (activePage - 1) * RATINGS_PER_PAGE,
              activePage * RATINGS_PER_PAGE
            )
            .map(
              (s: Student) =>
                s &&
                getName(s).trim().length > 0 && (
                  <tr>
                    <td>{getUsername(s)}</td>
                    <td>{getName(s)}</td>
                    <td>{s.interaction_count}</td>
                  </tr>
                )
            )}
        </tbody>
      </Table>
      <PaginationButtons
        activePage={activePage}
        itemCount={getData.length}
        setActivePage={setActivePage}
      />
      <Form.Group id={STUDENT_TEXT_FIELD_GROUP_ID}>
        <Form.Label>Add students</Form.Label>
        <Form.Control
          as="textarea"
          cols={70}
          rows={10}
          id={STUDENT_TEXT_FIELD_ID}
          onChange={handleStudentTextChange}
          value={studentText}
          spellCheck={false}
          placeholder="course;name;canvasID;email"
        />
      </Form.Group>
      <Button
        id="submitButton"
        role="button"
        type="submit"
        variant="primary"
        value="Submit"
        onClick={handleStudentSubmit}
        disabled={studentTextSubmitDisabled}
        aria-disabled={studentTextSubmitDisabled}
      >
        Submit
      </Button>
    </>
  );
};

export default StudentTable;
