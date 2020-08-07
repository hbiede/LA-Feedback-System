/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useMemo, useState } from 'react';

import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import shallow from 'zustand/shallow';

import { InteractionRecord, SORT_CHARS, SortConfig } from 'statics/Types';

import getRowClass from 'components/TableRowColors';
import Redux from 'redux/modules';
import PaginationButton, {
  RATINGS_PER_PAGE,
} from 'components/PaginationButton';

type Props = {
  showLA: (la: InteractionRecord) => void;
};

const SummaryTable = ({ showLA }: Props) => {
  const { interactions } = Redux(
    (state) => ({
      interactions: state.interactions,
    }),
    shallow
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'la',
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
      setActivePage(0);
      setSearchTerm(event.currentTarget.value);
    },
    [setSearchTerm]
  );

  const clearSearch = useCallback(() => {
    if (searchTerm.length > 0) {
      setSearchTerm('');
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
      <InputGroup className="mt-3 mb-2 col-4" style={{ paddingLeft: 0 }}>
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
            <th role="columnheader" id="la" onClick={handleSortClick}>
              {`LA ${column === 'la' ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th role="columnheader" id="course" onClick={handleSortClick}>
              {`Course ${column === 'course' ? SORT_CHARS.get(order) : ' '}`}
            </th>
            <th role="columnheader" id="int_count" onClick={handleSortClick}>
              {`Interactions ${
                column === 'int_count' ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th role="columnheader" id="avg_rating" onClick={handleSortClick}>
              {`Average Rating ${
                column === 'avg_rating' ? SORT_CHARS.get(order) : ' '
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
                    className={getRowClass(row.avg)}
                    onClick={() => showLA(row)}
                  >
                    <td>{row.name ? row.name : row.username}</td>
                    <td>{row.course ?? '---'}</td>
                    <td>{row.count}</td>
                    <td>
                      {row.avg !== null &&
                      !Number.isNaN(row.avg) &&
                      row.avg.toFixed
                        ? row.avg.toFixed(2)
                        : 'No Reviews'}
                    </td>
                  </tr>
                )
            )}
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

export default SummaryTable;
