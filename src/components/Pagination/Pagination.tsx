"use client";

import ReactPaginate from "react-paginate";
import { useRouter } from "next/navigation";
import "./Pagination.scss";

type PaginationProps = {
  pageCount: number;
  currentPage: number;
};

export const Pagination = ({ pageCount, currentPage }: PaginationProps) => {
  const router = useRouter();

  const handlePageChange = (selectedItem: { selected: number }) => {
    if (selectedItem) {
      const newPage = selectedItem.selected + 1;
      router.push(`?page=${newPage}`);
    }

    return;
  };

  return (
    <menu role="navigation">
      <ReactPaginate
        containerClassName="pagination"
        pageCount={pageCount}
        onPageChange={handlePageChange}
        forcePage={currentPage - 1}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        previousLabel="<"
        nextLabel=">"
        aria-label="Pagination"
        previousAriaLabel="Previous page"
        nextAriaLabel="Next page"
        ariaLabelBuilder={(page) => `Go to page ${page}`}
        renderOnZeroPageCount={null}
        activeClassName="active"
      />
    </menu>
  );
};
