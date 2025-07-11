"use client";
import { flexRender, RowData, Table } from "@tanstack/react-table";
import * as React from "react";
import { AiFillCaretDown } from "react-icons/ai";

import clsxm from "@/app/lib/clsxm";

type THeadProps<T extends RowData> = {
  omitSort: boolean;
  table: Table<T>;
} & React.ComponentPropsWithoutRef<"div">;

export default function THead<T extends RowData>({
  className,
  omitSort,
  table,
  ...rest
}: THeadProps<T>) {
  return (
    <thead
      className={clsxm("bg-[#EBEBEB] text-[#000000]", className)}
      {...rest}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              scope="col"
              className={clsxm(
                "group py-1 pr-3 text-center text-sm font-semibold sm:text-base",
                !omitSort && header.column.getCanSort() ? "pl-0" : "pl-[30px]"
              )}
            >
              {header.isPlaceholder ? null : (
                <div
                  className={clsxm(
                    "relative flex items-center justify-center gap-2 pb-1",
                    !omitSort && header.column.getCanSort()
                      ? "cursor-pointer select-none"
                      : ""
                  )}
                  onClick={
                    omitSort
                      ? () => null
                      : header.column.getToggleSortingHandler()
                  }
                >
                  {!omitSort &&
                  header.column.getCanSort() &&
                  !header.column.getIsSorted() ? (
                    <AiFillCaretDown className="w-2 rotate-180 fill-transparent group-hover:fill-black" />
                  ) : (
                    {
                      asc: (
                        <AiFillCaretDown className="w-2 rotate-180 fill-black" />
                      ),
                      desc: <AiFillCaretDown className="w-2 fill-black" />,
                    }[header.column.getIsSorted() as string] ?? null
                  )}
                  <p className="text-[#000000]">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </p>
                </div>
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}
