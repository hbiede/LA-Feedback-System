/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { useCallback, useMemo, useState } from 'react';

import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import shallow from 'zustand/shallow';

import { InteractionRecord, SORT_CHARS, SortConfig } from 'statics/Types';

import getRowClass from 'components/TableRowColors';
import Redux, { AppReduxState } from 'redux/modules';
import PaginationButtons, {
  RATINGS_PER_PAGE,
} from 'components/PaginationButtons';

import ServiceInterface from '../statics/ServiceInterface';

type Props = {
  showLA: (la: InteractionRecord) => void;
};

const LA_ID = 'la_name';
const COURSE_ID = 'course';
const INTERACTION_COUNT_ID = 'int_count';
const WEEKLY_INTERACTION_COUNT_ID = 'week_int_count';
const AVERAGE_RATING_ID = 'avg_rating';

const LASummaryTable = ({ showLA }: Props) => {
  const { interactions } = Redux(
    (state: AppReduxState) => ({
      interactions: state.interactions,
    }),
    shallow
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: LA_ID,
    order: 1,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activePage, setActivePage] = useState(1);

  const getData = useMemo(
    () =>
      interactions.ratings
        .slice()
        .filter((rating) => {
          const trimmedTerm = searchTerm.trim().toLowerCase();
          const regexCompilation = new RegExp(trimmedTerm, 'i');
          const { username, name } = rating;
          return (
            username.toLowerCase().includes(trimmedTerm) ||
            (name && name.toLowerCase().includes(trimmedTerm)) ||
            regexCompilation.test(username) ||
            (name && regexCompilation.test(name))
          );
        })
        .sort((a, b) => {
          let cmp = 0;
          switch (sortConfig.column) {
            case COURSE_ID:
              if (!a.course && !b.course) return 0;
              if (!a.course) return 1;
              if (!b.course) return -1;

              return sortConfig.order * a.course.localeCompare(b.course);
            case INTERACTION_COUNT_ID:
              if (a.count < b.count) {
                cmp = -1;
              } else if (a.count > b.count) {
                cmp = 1;
              }
              return sortConfig.order * cmp;
            case WEEKLY_INTERACTION_COUNT_ID:
              if (a.wCount < b.wCount) {
                cmp = -1;
              } else if (a.wCount > b.wCount) {
                cmp = 1;
              }
              return sortConfig.order * cmp;
            case AVERAGE_RATING_ID:
              const aDoesntExist = !a.avg || a.avg === 0;
              const bDoesntExist = !b.avg || b.avg === 0;
              if (aDoesntExist && bDoesntExist) return 0;
              if (aDoesntExist) return 1;
              if (bDoesntExist) return -1;

              // Stupid TS
              const aAvg = a.avg ?? 0;
              const bAvg = b.avg ?? 0;
              if (aAvg < bAvg) {
                cmp = -1;
              } else if (aAvg > bAvg) {
                cmp = 1;
              }
              return sortConfig.order * cmp;
            default:
              return (
                sortConfig.order *
                (a.name ?? a.username).localeCompare(b.name ?? b.username)
              );
          }
        }),
    [searchTerm, sortConfig, interactions.ratings]
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

  const { column, order } = sortConfig;
  const clearableSearch = searchTerm.length > 0;
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
            ) /* Magnifying Class */
          }
        </InputGroup.Append>
      </InputGroup>
      <Table hover style={{ width: '100%', cursor: 'default' }} role="table">
        <thead className="thead-dark">
          <tr>
            <th role="columnheader" id={LA_ID} onClick={handleSortClick}>
              {`LA ${column === LA_ID ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th role="columnheader" id={COURSE_ID} onClick={handleSortClick}>
              {`Course ${column === COURSE_ID ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th
              role="columnheader"
              id={INTERACTION_COUNT_ID}
              onClick={handleSortClick}
            >
              {`Interactions ${
                column === INTERACTION_COUNT_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th
              role="columnheader"
              id={WEEKLY_INTERACTION_COUNT_ID}
              onClick={handleSortClick}
            >
              {`Weekly Interactions ${
                column === WEEKLY_INTERACTION_COUNT_ID
                  ? SORT_CHARS.get(order)
                  : ' '
              }`}
            </th>
            <th
              role="columnheader"
              id={AVERAGE_RATING_ID}
              onClick={handleSortClick}
            >
              {`Average Rating ${
                column === AVERAGE_RATING_ID ? SORT_CHARS.get(order) : ' '
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
              (row: InteractionRecord) =>
                row.username &&
                row.username.trim().length > 0 &&
                !Number.isNaN(row.count) && (
                  <tr
                    className={getRowClass(row.avg ?? 0)}
                    onClick={() => showLA(row)}
                  >
                    <td>{row.name ? row.name : row.username}</td>
                    <td>{row.course}</td>
                    <td>{row.count}</td>
                    <td>{row.wCount}</td>
                    <td>
                      {row.avg !== null &&
                      !Number.isNaN(row.avg) &&
                      row.avg.toFixed
                        ? `${row.avg.toFixed(2)} (${row.fCount})`
                        : 'No Reviews'}
                    </td>
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
      <Button
        href={`${ServiceInterface.getPath()}/feedbackDownload.php`}
        type="button"
        variant="primary"
        style={{ marginBottom: 20 }}
      >
        Download Feedback as CSV
      </Button>
    </>
  );
};

export default LASummaryTable;
