/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { useCallback, useMemo, useState } from 'react';

import Table from 'react-bootstrap/Table';

import shallow from 'zustand/shallow';

import PaginationButtons, {
  RATINGS_PER_PAGE,
} from 'components/PaginationButtons';

import getRowClass from 'components/TableRowColors';

import Redux from 'redux/modules';

import { SORT_CHARS, SortConfig } from 'statics/Types';

const RATING_ID = 'rating_col_header';
const TIME_ID = 'time_col_header';
const SENTIMENT_ID = 'sentiment_col_header';
const COURSE_ID = 'course_col_header';

const LAAdminTable = () => {
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
        const {
          rating: ratingA,
          time: timeA,
          course: courseA,
          sentiment: sentimentA,
        } = a;
        const {
          rating: ratingB,
          time: timeB,
          course: courseB,
          sentiment: sentimentB,
        } = b;
        switch (column) {
          case TIME_ID:
            if (timeA < timeB) {
              cmp = -1;
            } else if (timeA > timeB) {
              cmp = 1;
            }
            return order * cmp;
          case COURSE_ID:
            return order * courseA.localeCompare(courseB);
          case SENTIMENT_ID:
            const sentimentANum = sentimentA ?? 0;
            const sentimentBNum = sentimentB ?? 0;
            if (sentimentANum < sentimentBNum) {
              cmp = -1;
            } else if (sentimentANum > sentimentBNum) {
              cmp = 1;
            }
            return order * cmp;
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
  const [firstRating, ...rest] = ratings;
  const firstCourse = firstRating.course ?? null;
  const isMultiCourseLA =
    rest.length > 0 && !rest.every((r) => r.course === firstCourse);

  return (
    <>
      <Table hover style={{ width: '100%', cursor: 'default' }}>
        <thead className="thead-dark">
          <tr>
            <th id={RATING_ID} onClick={handleSortClick}>
              {`Rating (Avg: ${avg.toFixed(2)}) ${
                column === RATING_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th id={TIME_ID} onClick={handleSortClick}>
              {`Time of Interaction ${
                column === TIME_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th id={SENTIMENT_ID} onClick={handleSortClick}>
              {`Sentiment ${
                column === SENTIMENT_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            {isMultiCourseLA && (
              <th id={COURSE_ID} onClick={handleSortClick}>
                {`Course ${column === COURSE_ID ? SORT_CHARS.get(order) : ' '}`}
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
                <td>{row.sentiment ? `${row.sentiment}%` : '---'}</td>
                {isMultiCourseLA && <td>{row.course}</td>}
                <td>{row.comment}</td>
              </tr>
            ))}
        </tbody>
      </Table>
      <PaginationButtons
        activePage={activePage}
        itemCount={getData.length}
        setActivePage={setActivePage}
      />
    </>
  );
};

export default LAAdminTable;
