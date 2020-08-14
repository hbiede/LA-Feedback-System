/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Table from 'react-bootstrap/Table';

import shallow from 'zustand/shallow';

import Redux from 'redux/modules';

import { CourseCount } from 'redux/modules/Types';

import { SORT_CHARS, SortConfig } from 'statics/Types';

const COURSE_ID = 'course_title';
const COUNT_ID = 'course_count';

const CountsTable = () => {
  const { getCounts } = Redux(
    (state) => ({
      getCounts: state.getCounts,
    }),
    shallow
  );
  const [counts, setCounts] = useState<CourseCount[] | null>(null);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: COURSE_ID,
    order: 1,
  });

  useEffect(() => {
    getCounts().then((count) => {
      setCounts(count);
    });
    // No Deps == componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = useMemo(
    () =>
      counts === null
        ? []
        : counts.slice().sort((a, b) => {
            let cmp = 0;
            const { column, order } = sortConfig;
            switch (column) {
              case COUNT_ID:
                if (a.count < b.count) {
                  cmp = -1;
                } else if (a.count > b.count) {
                  cmp = 1;
                }
                return order * cmp;
              default:
                return order * a.course.localeCompare(b.course);
            }
          }),
    [sortConfig, counts]
  );

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
    },
    [sortConfig, setSortConfig]
  );

  if (counts === null) {
    return <h4>Loading</h4>;
  }

  if (counts?.length === 0) {
    return <h4>No interactions</h4>;
  }

  const { column, order } = sortConfig;
  return (
    <>
      <h4>Interactions Per Course (Last 7 Days)</h4>
      <Table hover style={{ width: '100%', cursor: 'default' }}>
        <thead className="thead-dark">
          <tr>
            <th id={COURSE_ID} onClick={handleSortClick}>
              {`Course ${column === COURSE_ID ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th id={COUNT_ID} onClick={handleSortClick}>
              {`Interactions ${
                column === COUNT_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
          </tr>
        </thead>
        <tbody>
          {getData.map(
            (row) =>
              row &&
              row.count &&
              !Number.isNaN(row.count) && (
                <tr>
                  <td>{row.course}</td>
                  <td>{row.count.toFixed(0)}</td>
                </tr>
              )
          )}
        </tbody>
      </Table>
    </>
  );
};

export default CountsTable;
