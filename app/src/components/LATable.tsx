/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useMemo, useState } from 'react';

import Table from 'react-bootstrap/Table';

import shallow from 'zustand/shallow';

import PaginationButton, {
  RATINGS_PER_PAGE,
} from 'components/PaginationButton';

import getRowClass from 'components/TableRowColors';

import Redux from 'redux/modules';

import { SORT_CHARS, SortConfig } from 'statics/Types';

const LATable = () => {
  const { ratings } = Redux(
    (state) => ({
      ratings: state.ratings,
    }),
    shallow
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'rating',
    order: 1,
  });
  const [activePage, setActivePage] = useState(1);

  const getData = useMemo(
    () =>
      ratings.slice().sort((a, b) => {
        let cmp = 0;
        const { column, order } = sortConfig;
        const { rating: ratingA, time: timeA, course: courseA } = a;
        const { rating: ratingB, time: timeB, course: courseB } = b;
        switch (column) {
          case 'time':
            if (timeA < timeB) {
              cmp = -1;
            } else if (timeA > timeB) {
              cmp = 1;
            }
            return order * cmp;
          case 'course':
            return order * courseA.localeCompare(courseB);
          default:
            if (ratingA < ratingB) {
              cmp = -1;
            } else if (ratingA > ratingB) {
              cmp = 1;
            }
            return order * cmp;
        }
      }),
    [sortConfig, ratings]
  );

  const handleSortClick = useCallback(
    (event: React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>) => {
      const { id: clickedHeader } = event.currentTarget;
      const { column, order } = sortConfig;
      setActivePage(1);

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

  if (ratings.length === 0) return null;

  const avg =
    ratings.length === 0
      ? 0
      : ratings.reduce((acc, rating) => acc + rating.rating, 0) /
        ratings.length;
  const { column, order } = sortConfig;
  const [course, ...rest] = ratings;
  const firstCourse = course.course ?? null;
  const isMultiCourseLA =
    rest.length > 0 && !rest.every((r) => r.course === firstCourse);

  return (
    <>
      <Table hover style={{ width: '100%', cursor: 'default' }}>
        <thead className="thead-dark">
          <tr>
            <th id="rating" onClick={handleSortClick}>
              {`Rating (Avg: ${avg.toFixed(2)}) ${
                column === 'rating' ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th id="time" onClick={handleSortClick}>
              {`Time of Interaction ${
                column === 'time' ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            {isMultiCourseLA && (
              <th id="course" onClick={handleSortClick}>
                Course
              </th>
            )}
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {getData
            .slice(
              (activePage - 1) * RATINGS_PER_PAGE,
              activePage * RATINGS_PER_PAGE
            )
            .map((row) => (
              <tr className={getRowClass(row.rating)}>
                <td>{row.rating.toFixed(2)}</td>
                <td>{row.time.toLocaleString()}</td>
                {isMultiCourseLA && <td>{row.course}</td>}
                <td>{row.comment}</td>
              </tr>
            ))}
        </tbody>
      </Table>
      <PaginationButton
        activePage={activePage}
        itemCount={getData.length}
        setActivePage={setActivePage}
      />
    </>
  );
};

export default LATable;
