/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import React, { useCallback, useMemo } from 'react';
import Pagination from 'react-bootstrap/Pagination';

export const RATINGS_PER_PAGE = 10;

type Props = {
  itemCount: number;
  activePage: number;
  setActivePage: (page: number) => void;
};

const PaginationButton = ({ itemCount, activePage, setActivePage }: Props) => {
  const handlePageClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const page = Number.parseInt(event.currentTarget.innerText, 10);
      if (!Number.isNaN(page)) {
        setActivePage(page);
      }
    },
    [setActivePage]
  );

  const paginationButtons = useMemo(
    () =>
      Array.from(Array(Math.ceil(itemCount / RATINGS_PER_PAGE)).keys()).map(
        (pageNumber) => (
          <Pagination.Item
            value={pageNumber}
            active={activePage === pageNumber}
            onClick={handlePageClick}
          >
            {pageNumber + 1}
          </Pagination.Item>
        )
      ),
    [activePage, itemCount, handlePageClick]
  );

  return (
    <>
      {itemCount > RATINGS_PER_PAGE && (
        <Pagination style={{ justifyContent: 'center' }}>
          {paginationButtons}
        </Pagination>
      )}
    </>
  );
};

export default PaginationButton;
