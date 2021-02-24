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

import ServiceInterface from 'statics/ServiceInterface';
import { SORT_CHARS, SortConfig } from 'statics/Types';

import Redux, { AppReduxState } from 'redux/modules';
import PaginationButtons, {
  RATINGS_PER_PAGE,
} from 'components/PaginationButtons';

const LA_ID = 'la_name_column';
const DATE_ID = 'time_of_interaction_column';

const LoginTable = () => {
  const { logins } = Redux(
    (state: AppReduxState) => ({
      logins: state.interactions.logins,
    }),
    shallow
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: DATE_ID,
    order: 1,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activePage, setActivePage] = useState(1);

  const getData = useMemo(
    () =>
      logins
        .filter((login) => {
          const trimmedTerm = searchTerm.trim().toLowerCase();
          return (
            login.la.toLowerCase().includes(trimmedTerm) ||
            new RegExp(trimmedTerm, 'i').test(login.la)
          );
        })
        .sort((a, b) => {
          let cmp = 0;
          switch (sortConfig.column) {
            case DATE_ID:
              if (a.timeOfInteraction < b.timeOfInteraction) {
                cmp = -1;
              } else if (a.timeOfInteraction > b.timeOfInteraction) {
                cmp = 1;
              }
              return sortConfig.order * cmp;
            default:
              return sortConfig.order * a.la.localeCompare(b.la);
          }
        }),
    [searchTerm, sortConfig, logins]
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
            <th
              role="columnheader"
              id={LA_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`LA ${column === LA_ID ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th
              role="columnheader"
              id={DATE_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Date ${column === DATE_ID ? SORT_CHARS.get(order) : ' '}`}
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
              ({ la, timeOfInteraction }) =>
                la &&
                la.trim().length > 0 &&
                timeOfInteraction && (
                  <tr>
                    <td>{la}</td>
                    <td>{timeOfInteraction.toLocaleString()}</td>
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

export default LoginTable;
