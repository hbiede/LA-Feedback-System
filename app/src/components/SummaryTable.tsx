/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useMemo, useState } from 'react';

import {
  InteractionRecord,
  InteractionSummary,
  SortConfig,
  SORT_CHARS,
} from '../types';

type Props = {
  showLA: (la: InteractionRecord) => void;
  interactions: InteractionSummary;
};

const SummaryTable = ({ showLA, interactions }: Props) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'la', order: 1 });

  const getData = useMemo(() => interactions.ratings.slice().sort((a, b) => {
    let cmp = 0;
    switch (sortConfig.column) {
      case 'course':
        return sortConfig.order * a.course.localeCompare(b.course);
      case 'int_count':
        if (a.count < b.count) {
          cmp = -1;
        } else if (a.count > b.count) {
          cmp = 1;
        }
        return sortConfig.order * cmp;
      case 'avg_rating':
        if (a.count === 0 && b.count === 0) return 0;
        if (a.count === 0) return 1;
        if (b.count === 0) return -1;

        if (a.avg < b.avg) {
          cmp = -1;
        } else if (a.avg > b.avg) {
          cmp = 1;
        }
        return sortConfig.order * cmp;
      default:
        return sortConfig.order * (a.name ?? a.username).localeCompare((b.name ?? b.username));
    }
  }), [sortConfig, interactions.ratings]);

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

  const { column, order } = sortConfig;
  return (
    <table className="table table-hover" style={{ width: '100%' }}>
      <thead className="thead-dark">
        <tr>
          <th id="la" onClick={handleSortClick}>
            {`LA ${column === 'la' ? (SORT_CHARS.get(order)) : ' '}`}
          </th>
          <th id="course" onClick={handleSortClick}>
            {`Course ${column === 'course' ? (SORT_CHARS.get(order)) : ' '}`}
          </th>
          <th id="int_count" onClick={handleSortClick}>
            {`Interactions ${column === 'int_count' ? (SORT_CHARS.get(order)) : ' '}`}
          </th>
          <th id="avg_rating" onClick={handleSortClick}>
            {`Average Rating ${column === 'avg_rating' ? (SORT_CHARS.get(order)) : ' '}`}
          </th>
        </tr>
      </thead>
      <tbody>
        {getData.map((row: InteractionRecord) => (
          row.username && row.username.trim().length > 0 && !Number.isNaN(row.count) && (
            <tr onClick={() => showLA(row)}>
              <td>{row.name ? row.name : row.username}</td>
              <td>{row.course}</td>
              <td>{row.count}</td>
              <td>{row.avg === null || Number.isNaN(row.avg) ? 'No Reviews' : row.avg}</td>
            </tr>
          )
        ))}
      </tbody>
    </table>
  );
};

export default SummaryTable;
