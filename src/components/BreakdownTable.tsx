/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Table from 'react-bootstrap/Table';

import shallow from 'zustand/shallow';

import Redux, { AppReduxState } from 'redux/modules';

import { InteractionBreakdown } from 'redux/modules/Types';

import { SORT_CHARS, SortConfig } from 'statics/Types';

const NAME_ID = 'int_breakdown_name';
const COURSE_ID = 'int_breakdown_course';
const COUNT_ID = 'int_breakdown_count';
const WEEK_COUNT_ID = 'int_breakdown_weekly_count';

type Props = {
  style?: CSSProperties;
};

/**
 * The table viewble from the stats page containing the number of interactions per LA
 */
const BreakdownTable = ({ style }: Props) => {
  const { getInteractionBreakdowns } = Redux(
    (state: AppReduxState) => ({
      getInteractionBreakdowns: state.getInteractionBreakdowns,
    }),
    shallow
  );
  const [breakdowns, setBreakdowns] = useState<InteractionBreakdown[] | null>(
    null
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: NAME_ID,
    order: 1,
  });

  useEffect(() => {
    getInteractionBreakdowns().then((ints) => {
      setBreakdowns(ints);
    });
    // No Deps == componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = useMemo(
    () =>
      breakdowns === null
        ? []
        : breakdowns.slice().sort((a, b) => {
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
              case WEEK_COUNT_ID:
                if (a.wcount < b.wcount) {
                  cmp = -1;
                } else if (a.wcount > b.wcount) {
                  cmp = 1;
                }
                return order * cmp;
              case NAME_ID:
                return order * a.name.localeCompare(b.name);
              default:
                return order * a.course.localeCompare(b.course);
            }
          }),
    [sortConfig, breakdowns]
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

  if (breakdowns === null) {
    return <h4>Loading</h4>;
  }

  if (breakdowns?.length === 0) {
    return <h4>No interactions</h4>;
  }

  const { column, order } = sortConfig;
  return (
    <div style={style}>
      <h4>Interactions per LA</h4>
      <Table hover style={{ width: '100%', cursor: 'default' }}>
        <thead className="thead-dark">
          <tr>
            <th
              id={NAME_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Name ${column === NAME_ID ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th
              id={COURSE_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Course ${column === COURSE_ID ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th
              id={COUNT_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Interactions ${
                column === COUNT_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th
              id={WEEK_COUNT_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Interactions (Last 7 Days) ${
                column === WEEK_COUNT_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
          </tr>
        </thead>
        <tbody>
          {getData.map(
            (row) =>
              row && (
                <tr>
                  <td>{row.name}</td>
                  <td>{row.course}</td>
                  <td>{row.count}</td>
                  <td>{row.wcount}</td>
                </tr>
              )
          )}
        </tbody>
      </Table>
    </div>
  );
};

BreakdownTable.defaultProps = {
  style: {},
};

export default BreakdownTable;
