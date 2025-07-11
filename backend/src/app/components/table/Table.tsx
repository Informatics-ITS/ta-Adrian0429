"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryStates } from "nuqs";
import * as React from "react";

import Filter from "@/app/components/table/Filter";
import PaginationControl from "@/app/components/table/PaginationControl";
import TBody from "@/app/components/table/TBody";
import THead from "@/app/components/table/THead";
import TOption from "@/app/components/table/TOption";
import clsxm from "@/app/lib/clsxm";
import Dropdown from "../Dropdown";

type TableProps<T extends object> = {
  data: T[];
  columns: ColumnDef<T>[];
  footers?: React.ReactNode;
  extras?: React.ReactNode;
  isLoading?: boolean;
  omitSort?: boolean;
  withFilter?: boolean;
  withEntries?: boolean;
  withPaginationControl?: boolean;
  withLink?: boolean;
  tableClassName?: string;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  columnToggle?: {
    enabled: boolean;
    title?: string;
    defaultVisibility?: VisibilityState;
    className?: string;
  };
} & React.ComponentPropsWithoutRef<"div">;

export default function Table<T extends object>({
  className,
  columns,
  data,
  footers,
  extras,
  isLoading,
  omitSort = false,
  withFilter = false,
  withEntries = false,
  withPaginationControl = false,
  withLink = false,
  tableClassName,
  onColumnVisibilityChange,
  columnToggle = { enabled: false },
  ...rest
}: TableProps<T>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      columnToggle.defaultVisibility ??
        Object.fromEntries(columns.map((col) => [col.id, true]))
    );

  const [pages, setPage] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      size: parseAsInteger.withDefault(10),
    },
    {
      throttleMs: 1000,
      shallow: false,
    }
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
    },

    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  React.useEffect(() => {
    table.setPageIndex(pages.page - 1);
    table.setPageSize(pages.size);
  }, [pages.page, pages.size, table]);

  React.useEffect(() => {
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(columnVisibility);
    }
  }, [columnVisibility, onColumnVisibilityChange]);

  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  const columnHeaders = hideableColumns.map((column) => {
    const headerValue = column.columnDef.header;
    return typeof headerValue === "function" ? column.id : String(headerValue);
  });

  const headerToId = Object.fromEntries(
    hideableColumns.map((column, index) => [columnHeaders[index], column.id])
  );

  const idToHeader = Object.fromEntries(
    hideableColumns.map((column, index) => [column.id, columnHeaders[index]])
  );

  const handleColumnVisibilityChange = (selected: string[]) => {
    const newVisibility: VisibilityState = {};
    hideableColumns.forEach((column) => {
      const headerName = idToHeader[column.id];
      newVisibility[column.id] = selected.includes(headerName);
    });
    setColumnVisibility(newVisibility);
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(newVisibility);
    }
  };

  return (
    <div className={clsxm("flex flex-col", className)} {...rest}>
      <div className={`flex items-end justify-between gap-5 mb-2`}>
        <div className="flex items-start gap-2">
          {withFilter && <Filter table={table} />}
          {columnToggle.enabled && (
            <Dropdown
              type="checkbox"
              sizes={columnHeaders}
              title={columnToggle.title || "Show Columns"}
              onFilterChange={handleColumnVisibilityChange}
              className={columnToggle.className}
            />
          )}
        </div>

        <div className="flex items-end gap-4">
          {extras && <>{extras}</>}
          {withEntries && (
            <TOption
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                setPage((prev) => ({ ...prev, size: Number(e) }));
                table.setPageSize(Number(e));
              }}
              title="Show"
              options={[
                { value: 10, label: "10 entries" },
                { value: 25, label: "25 entries" },
                { value: 50, label: "50 entries" },
                { value: 100, label: "100 entries" },
                { value: 99999999999999999999, label: "Show All" },
              ]}
            />
          )}
        </div>
      </div>
      <div className="-my-2 mt-2 overflow-x-auto sm:-mx-6 lg:-mx-8 px-2">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-8 ring-[#EBEBEB] md:rounded-lg">
            <div
              className={`relative overflow-y-auto custom-scrollbar ${tableClassName}`}
            >
              <table className="min-w-full">
                <THead
                  table={table}
                  omitSort={omitSort}
                  className="sticky top-0 z-0"
                />
                <TBody
                  table={table}
                  isLoading={isLoading}
                  withLink={withLink}
                />
                {footers && (
                  <tfoot className="bg-[#EBEBEB] sticky bottom-0 z-0">
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-S2 pt-2 pl-2"
                      >
                        {footers}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
      {withPaginationControl && (
        <PaginationControl
          table={table}
          data={data}
          setParams={setPage}
          className="mt-3"
        />
      )}
    </div>
  );
}
