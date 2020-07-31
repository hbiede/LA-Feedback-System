/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useMemo, useState } from 'react';

import { RatingRecord, SortConfig, SORT_CHARS } from '../types';

type Props = {
  ratings: RatingRecord[];
};

const LATable = ({ ratings }: Props) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'la', order: 1 });

  const getData = useMemo(() => ratings.slice().sort((a, b) => {
    let cmp = 0;
    const { column, order } = sortConfig;
    switch (column) {
      case 'time':
        if (a.time < b.time) {
          cmp = -1;
        } else if (a.time > b.time) {
          cmp = 1;
        }
        return order * cmp;
      case 'course':
        return order * a.course.localeCompare(b.course);
      default:
        if (a.rating < b.rating) {
          cmp = -1;
        } else if (a.rating > b.rating) {
          cmp = 1;
        }
        return order * cmp;
    }
  }), [sortConfig, ratings]);

  const handleSortClick = useCallback(
    (event: React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>) => {
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
    }, [sortConfig, setSortConfig],
  );

  const avg = ratings.length === 0
    ? 0
    : ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;
  const { column, order } = sortConfig;
  const firstCourse = ratings[0].course ?? null;
  const isMultiCourseLA = !ratings.every((r) => r.course === firstCourse);

  return (
    <table className="table table-hover" style={{ width: '100%', cursor: 'default' }}>
      <thead className="thead-dark">
        <tr>
          <th id="rating" onClick={handleSortClick}>
            {`Rating (Avg: ${avg}) ${column === 'rating' ? (SORT_CHARS.get(order)) : ' '}`}
          </th>
          <th id="time" onClick={handleSortClick}>
            {`Time of Interaction ${column === 'time' ? (SORT_CHARS.get(order)) : ' '}`}
          </th>
          {isMultiCourseLA
          && <th id="course" onClick={handleSortClick}>Course</th>}
          <th>Comment</th>
        </tr>
      </thead>
      <tbody>
        {getData.map((row) => (
          <tr>
            <td>{row.rating}</td>
            <td>{row.time.toLocaleString()}</td>
            {isMultiCourseLA
            && <td>{row.course}</td>}
            <td>{row.comment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LATable;
