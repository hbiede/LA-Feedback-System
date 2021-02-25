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

import { Admin, SORT_CHARS, SortConfig } from 'statics/Types';

import Redux, { AppReduxState } from 'redux/modules';
import PaginationButtons, {
  RATINGS_PER_PAGE,
} from 'components/PaginationButtons';

import ServiceInterface from '../../statics/ServiceInterface';

const ADMIN_USERNAME_ID = 'admin_username_column';
const REMOVE_ID = 'remove_admin_column';

const AdminTable = () => {
  const { addAdmin, admins, removeAdmin, setResponse } = Redux(
    (state: AppReduxState) => ({
      addAdmin: state.addAdmin,
      admins: state.interactions.admins,
      removeAdmin: state.removeAdmin,
      setResponse: state.setResponse,
    }),
    shallow
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: ADMIN_USERNAME_ID,
    order: 1,
  });
  const [newAdminValue, setNewAdminValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activePage, setActivePage] = useState(1);

  const getData = useMemo(
    () =>
      admins
        .filter((admin) => {
          const trimmedTerm = searchTerm.trim().toLowerCase();
          const regexCompilation = new RegExp(trimmedTerm, 'i');
          const { username } = admin;
          return (
            username.toLowerCase().includes(trimmedTerm) ||
            (username && regexCompilation.test(username))
          );
        })
        .sort(
          (a, b) => sortConfig.order * a.username.localeCompare(b.username)
        ),
    [searchTerm, sortConfig, admins]
  );

  const handleNewAdminValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewAdminValue(event.currentTarget.value);
    },
    []
  );
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setActivePage(1);
      setSearchTerm(event.currentTarget.value);
    },
    []
  );

  const clearSearch = useCallback(() => {
    if (searchTerm.length > 0) {
      setSearchTerm('');
      setActivePage(1);
    }
  }, [searchTerm]);

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

  const addAdminCallback = useCallback(() => {
    addAdmin(newAdminValue);
    setNewAdminValue('');
  }, [newAdminValue, addAdmin]);

  const removeCallback = useCallback(
    ({ id, username }: Admin) => {
      if (username === ServiceInterface.getAccountHost())
        setResponse({
          class: 'danger',
          content: 'You may not remove a superadmin',
        });
      else removeAdmin(id);
    },
    [removeAdmin, setResponse]
  );

  const { column, order } = sortConfig;
  const clearableSearch = searchTerm.length > 0;
  return (
    <>
      <InputGroup className="mt-3 mb-4 col-7" style={{ paddingLeft: 0 }}>
        <FormControl
          placeholder=" New Admin"
          aria-label="new admin"
          aria-describedby="add_admin"
          onChange={handleNewAdminValueChange}
          value={newAdminValue}
        />
        <InputGroup.Append>
          <Button
            spellCheck={false}
            id="add_admin"
            onClick={addAdminCallback}
            variant="outline-secondary"
            style={{
              cursor: 'default',
              opacity: newAdminValue.length === 0 ? 0.3 : 1,
            }}
          >
            {'\u2705' /* Checkmark Emoji */}
          </Button>
        </InputGroup.Append>
      </InputGroup>
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
            ) /* Magnifying Glass */
          }
        </InputGroup.Append>
      </InputGroup>
      <Table hover style={{ width: '100%', cursor: 'default' }} role="table">
        <thead className="thead-dark">
          <tr>
            <th
              role="columnheader"
              id={ADMIN_USERNAME_ID}
              onClick={handleSortClick}
              style={{ cursor: 'pointer' }}
            >
              {`Username ${
                column === ADMIN_USERNAME_ID ? SORT_CHARS.get(order) : ' '
              }`}
            </th>
            <th
              role="columnheader"
              id={REMOVE_ID}
              style={{ cursor: 'pointer' }}
            >
              Remove
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
              (s) =>
                s &&
                s.username.trim().length > 0 && (
                  <tr>
                    <td>{s.username}</td>
                    <td>
                      <Button
                        disabled={
                          s.username === ServiceInterface.getAccountHost()
                        }
                        onClick={() => removeCallback(s)}
                        variant="outline-secondary"
                        style={{
                          cursor: 'default',
                          opacity:
                            s.username === ServiceInterface.getAccountHost()
                              ? 0.3
                              : 1,
                        }}
                      >
                        {'\u274C' /* X Emoji */}
                      </Button>
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
      <h5>
        To reset the data base, log in to the{' '}
        {ServiceInterface.getAccountHost()} CSE account and run the following
        command:
        <br />
        <code>cd public_html/LA-Feedback && php resetSystem.php --reset</code>
      </h5>
    </>
  );
};

export default AdminTable;
