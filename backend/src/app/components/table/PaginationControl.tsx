import { RowData, Table } from "@tanstack/react-table";
import * as React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

import Button from "@/app/components/button/Button";
import clsxm from "@/app/lib/clsxm";
import { buildPaginationControl } from "@/app/lib/pagination";

type PaginationState = {
  page: number;
  size: number;
};

type PaginationControlProps<T extends RowData> = {
  data: T[];
  table: Table<T>;
  setParams: React.Dispatch<React.SetStateAction<PaginationState>>;
} & React.ComponentPropsWithoutRef<"div">;

/**
 *
 * @see https://javascript.plainenglish.io/create-a-pagination-in-a-react-way-df5c6fe1e0c7
 */
export default function PaginationControl<T extends RowData>({
  className,
  data,
  table,
  setParams,
  ...rest
}: PaginationControlProps<T>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();
  const paginationControl = buildPaginationControl(currentPage, pageCount);

  const handlePageControlClick = (page: string | number) => {
    if (page !== "...") {
      table.setPageIndex((page as number) - 1);
    }
  };

  return (
    <div
      className={clsxm(
        "flex items-center justify-between gap-x-2 md:justify-end",
        className
      )}
      {...rest}
    >
      <div className="flex items-center gap-1">
        <Button
          className={clsxm(
            "flex min-w-[38px] justify-center rounded-md !border-none !p-2 !font-semibold bg-brand-400",
            "disabled:cursor-not-allowed hover:bg-brand-500"
          )}
          disabled={!table.getCanPreviousPage()}
          onClick={() => {
            setParams((params) => ({
              ...params,
              page: Number(params.page) - 1,
            }));
            table.previousPage();
          }}
        >
          <HiChevronLeft size={20} />
        </Button>
        {paginationControl.map((pageIndex, index) => (
          <Button
            key={index}
            className={clsxm(
              "flex min-w-[38px] justify-center rounded-md border-2 border-primary-info-dark bg-white !p-2 !font-semibold text-primary-info-dark drop-shadow-sm hover:bg-brand-500",
              currentPage === pageIndex &&
                "bg-primary-info-hover text-typo-white"
            )}
            onClick={() => {
              setParams((params) => ({
                ...params,
                page: pageIndex as number,
              }));
              handlePageControlClick(pageIndex);
            }}
          >
            {pageIndex}
          </Button>
        ))}
        <Button
          className={clsxm(
            "flex min-w-[38px] justify-center rounded-md !border-none !p-2 !font-semibold text-white drop-shadow-sm ",
            "disabled:cursor-not-allowed bg-brand-400 hover:bg-brand-500"
          )}
          disabled={
            !table.getCanNextPage() ||
            data.length < table.getState().pagination.pageSize
          }
          onClick={() => {
            setParams((params) => ({
              ...params,
              page: Number(params.page) + 1,
            }));
            table.nextPage();
          }}
        >
          <HiChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
