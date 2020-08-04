/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Table from 'react-bootstrap/Table';

import { shallow } from 'zustand/shallow';

import Redux from 'redux/modules';

import { CourseAverages } from 'redux/modules/Types';

import { SORT_CHARS, SortConfig } from 'statics/Types';

const AveragesTable = () => {
  const { getAverages } = Redux(
    (state) => ({
      getAverages: state.getAverages,
    }),
    shallow
  );
  const [averages, setAverages] = useState<CourseAverages[]>([]);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'course',
    order: 1,
  });

  useEffect(() => {
    getAverages().then((avgs) => {
      setAverages(avgs);
    });
    // No Deps == componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = useMemo(
    () =>
      averages.slice().sort((a, b) => {
        let cmp = 0;
        const { column, order } = sortConfig;
        switch (column) {
          case 'avg':
            if (a.avg < b.avg) {
              cmp = -1;
            } else if (a.avg > b.avg) {
              cmp = 1;
            }
            return order * cmp;
          default:
            if (a.course < b.course) {
              cmp = -1;
            } else if (a.course > b.course) {
              cmp = 1;
            }
            return order * cmp;
        }
      }),
    [sortConfig, averages]
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

  if (averages === null || averages.length === 0) {
    return <h4>Loading</h4>;
  }

  const { column, order } = sortConfig;
  return (
    <>
      <h4>Average Feedback By Course</h4>
      <Table hover style={{ width: '100%', cursor: 'default' }}>
        <thead className="thead-dark">
          <tr>
            <th id="course" onClick={handleSortClick}>
              {`Course ${column === 'course' ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th id="avg" onClick={handleSortClick}>
              {`Average Rating ${
                column === 'avg' ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
          </tr>
        </thead>
        <tbody>
          {getData.map(
            (row) =>
              row &&
              row.avg &&
              !Number.isNaN(row.avg) && (
                <tr>
                  <td>{row.course}</td>
                  <td>{row.avg.toFixed(2)}</td>
                </tr>
              )
          )}
        </tbody>
      </Table>
    </>
  );
};

export default AveragesTable;
