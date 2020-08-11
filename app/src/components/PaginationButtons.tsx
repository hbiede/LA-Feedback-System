/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { useCallback, useMemo } from 'react';
import Pagination from 'react-bootstrap/Pagination';

export const RATINGS_PER_PAGE = 10;

type Props = {
  itemCount: number;
  activePage: number;
  setActivePage: (page: number) => void;
};

const MAX_PAGE_COUNT = 5;

const PaginationButtons = ({ itemCount, activePage, setActivePage }: Props) => {
  const handlePageClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const page = Number.parseInt(event.currentTarget.innerText, 10);
      if (!Number.isNaN(page)) {
        setActivePage(page);
      }
    },
    [setActivePage]
  );

  const paginationButtons = useMemo(() => {
    const pagesNeeded = Math.ceil(itemCount / RATINGS_PER_PAGE);
    if (pagesNeeded > MAX_PAGE_COUNT) {
      const baseNumber = Math.max(activePage - 2, 1);
      const pagination = [];
      if (baseNumber !== 1) {
        pagination.push(<Pagination.First onClick={() => setActivePage(1)} />);
      }
      if (baseNumber > 1) {
        pagination.push(<Pagination.Ellipsis />);
      }

      const maxPage = Math.min(baseNumber + MAX_PAGE_COUNT - 1, pagesNeeded);
      for (let i = baseNumber; i <= maxPage; i++) {
        pagination.push(
          <Pagination.Item active={activePage === i} onClick={handlePageClick}>
            {i}
          </Pagination.Item>
        );
      }

      if (baseNumber + MAX_PAGE_COUNT < pagesNeeded) {
        pagination.push(<Pagination.Ellipsis />);
      }
      if (activePage !== pagesNeeded) {
        pagination.push(
          <Pagination.Last onClick={() => setActivePage(pagesNeeded)} />
        );
      }
      return pagination;
    }

    return Array.from([].keys())
      .map((i) => i + 1)
      .map((pageNumber) => (
        <Pagination.Item
          active={activePage === pageNumber}
          onClick={handlePageClick}
        >
          {pageNumber}
        </Pagination.Item>
      ));
  }, [itemCount, activePage, setActivePage, handlePageClick]);

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

export default PaginationButtons;
