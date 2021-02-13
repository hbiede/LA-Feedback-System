import React, { Fragment, useMemo } from 'react';

import {
  Highlighter,
  Menu,
  MenuItem,
  Typeahead,
  TypeaheadMenuProps,
  TypeaheadProps,
  TypeaheadResult,
  TypeaheadState,
} from 'react-bootstrap-typeahead';

import shallow from 'zustand/shallow';

import { Student } from '../redux/modules/Types';
import { groupBy } from '../statics/Utils';
import Redux, { AppReduxState } from '../redux/modules';

type Props = Omit<TypeaheadProps<Student>, 'options'> & {
  course?: string | null;
};

const StudentSelectionTypeahead = ({
  course: filterCourse,
  ...rest
}: Props) => {
  const { students } = Redux(
    (state: AppReduxState) => ({
      students: state.students,
    }),
    shallow
  );

  const options = useMemo(() => {
    if (filterCourse != null && filterCourse !== 'choose') {
      const courseTrimmed = filterCourse.trim().toLowerCase();
      return students.filter(
        (student) =>
          student.course && student.course.toLowerCase().includes(courseTrimmed)
      );
    }
    return students;
  }, [filterCourse, students]);

  const renderMenu = (
    results: TypeaheadResult<Student>[],
    menuProps: TypeaheadMenuProps<Student>,
    state: TypeaheadState<Student>
  ) => {
    let index = -1;
    const studentsByCourse = groupBy<Student>(results, 'course');
    const courses = Object.keys(studentsByCourse)
      .sort()
      .map((course) => (
        <Fragment key={course}>
          {index !== -1 && <Menu.Divider />}
          <Menu.Header>{course}</Menu.Header>
          {studentsByCourse[course].map((student) => {
            index += 1;
            return (
              <MenuItem key={index} option={student} position={index}>
                <Highlighter search={state.text}>{student.name}</Highlighter>
                <div>
                  <small>
                    {student.canvas_username
                      ? `Canvas Username: ${student.canvas_username}`
                      : `Username: ${student.username}`}
                  </small>
                </div>
              </MenuItem>
            );
          })}
        </Fragment>
      ));

    return <Menu {...menuProps}>{courses}</Menu>;
  };

  const labelKey = (student: Student) =>
    `${student.name} (${student.canvas_username ?? student.username})`;

  return (
    <Typeahead<Student>
      {...rest}
      labelKey={labelKey}
      multiple
      renderMenu={renderMenu}
      options={options}
      clearButton
      minLength={2}
      flip
      highlightOnlyResult
      caseSensitive={false}
      allowNew={false}
    />
  );
};

StudentSelectionTypeahead.defaultProps = {
  course: undefined,
};

export default StudentSelectionTypeahead;
