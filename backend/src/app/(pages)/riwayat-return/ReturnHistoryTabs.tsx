import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { PendingStok } from "./page";
import ButtonLink from "@/app/components/button/ButtonLink";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@/app/components/table/Table";
import Dropdown from "@/app/components/Dropdown";
import Loading from "@/app/components/Loading";

type ColumnsType = UserReturn | SupplierReturn;

type UserReturnDetail = {
  nama_produk: string;
  barcode_id: string;
  jumlah_return: number;
  merk: string;
  ukuran: string;
  warna: string;
};

type UserReturn = {
  return_id: number;
  alasan: string;
  tanggal_return: string;
  nomor_nota: string;
  detail_return: UserReturnDetail[];
};

type SupplierReturnDetail = UserReturnDetail & {
  supplier: string;
};

type SupplierReturn = {
  return_id: number;
  alasan: string;
  tanggal_return: string;
  nomor_restok: string;
  detail_return: SupplierReturnDetail[];
};

function formatISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function ReturnHistoryTabs() {
  const now = new Date();
  now.setHours(new Date().getHours() + 7);

  const [filterStartDate, setFilterStartDate] = useState(formatISODate(now));
  const [filterEndDate, setFilterEndDate] = useState(formatISODate(now));

  const [isUserTab, setIsUserTab] = useState(true);

  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const today = new Date();

    if (dateFormat === "XX Hari") {
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} hari`;
    } else {
      // Default DD/MM/YYYY format
      return date
        .toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "/");
    }
  };

  const { data: userReturns, isLoading: userLoading } = useQuery({
    queryKey: ["user-returns", filterStartDate, filterEndDate],
    queryFn: async () => {
      const response = await api.get("/api/return/history/user", {
        params: { start_date: filterStartDate, end_date: filterEndDate },
      });
      return response.data.data;
    },
    enabled: isUserTab,
  });

  const { data: supplierReturns, isLoading: supplierLoading } = useQuery({
    queryKey: ["supplier-returns", filterStartDate, filterEndDate],
    queryFn: async () => {
      const response = await api.get("/api/return/history/supplier", {
        params: { start_date: filterStartDate, end_date: filterEndDate },
      });
      return response.data.data;
    },
    enabled: !isUserTab,
  });

  const UserReturnColumns: ColumnDef<UserReturn>[] = [
    {
      accessorKey: "return_id",
      header: "Return ID",
      cell: (props) => <span>{props.getValue() as number}</span>,
    },
    {
      accessorKey: "nomor_nota",
      header: "Nomor Nota",
      cell: (props) => <span>{props.getValue() as string}</span>,
    },
    {
      accessorKey: "tanggal_return",
      header: "Tanggal Return",
      cell: (props) => <span>{formatDate(props.getValue() as string)}</span>,
    },
    {
      accessorKey: "alasan",
      header: "Alasan",
      cell: (props) => <span>{props.getValue() as string}</span>,
    },
    {
      id: "nama_produk",
      header: "Nama Produk",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<UserReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.nama_produk}</span>
          ))}
        </div>
      ),
    },
    {
      id: "merk",
      header: "Merk",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<UserReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.merk}</span>
          ))}
        </div>
      ),
    },
    {
      id: "ukuran",
      header: "Ukuran",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<UserReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.ukuran}</span>
          ))}
        </div>
      ),
    },
    {
      id: "warna",
      header: "Warna",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<UserReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.warna}</span>
          ))}
        </div>
      ),
    },
    {
      id: "jumlah_return",
      header: "Jumlah",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<UserReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.jumlah_return}</span>
          ))}
        </div>
      ),
    },
  ];

  const SupplierReturnColumns: ColumnDef<SupplierReturn>[] = [
    {
      accessorKey: "return_id",
      header: "Return ID",
      cell: (props) => <span>{props.getValue() as number}</span>,
    },
    {
      accessorKey: "nomor_restok",
      header: "Nomor Restok",
      cell: (props) => <span>{props.getValue() as string}</span>,
    },
    {
      accessorKey: "tanggal_return",
      header: "Tanggal Return",
      cell: (props) => <span>{formatDate(props.getValue() as string)}</span>,
    },
    {
      accessorKey: "alasan",
      header: "Alasan",
      cell: (props) => <span>{props.getValue() as string}</span>,
    },
    {
      id: "nama_produk",
      header: "Nama Produk",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<SupplierReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.nama_produk}</span>
          ))}
        </div>
      ),
    },
    {
      id: "merk",
      header: "Merk",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<SupplierReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.merk}</span>
          ))}
        </div>
      ),
    },
    {
      id: "ukuran",
      header: "Ukuran",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<SupplierReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.ukuran}</span>
          ))}
        </div>
      ),
    },
    {
      id: "warna",
      header: "Warna",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<SupplierReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.warna}</span>
          ))}
        </div>
      ),
    },
    {
      id: "jumlah_return",
      header: "Jumlah",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<SupplierReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.jumlah_return}</span>
          ))}
        </div>
      ),
    },
    {
      id: "supplier",
      header: "Supplier",
      accessorFn: (row) => row.detail_return,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<SupplierReturnDetail[]>().map((detail, idx) => (
            <span key={idx}>{detail.supplier}</span>
          ))}
        </div>
      ),
    },
  ];

  if (userLoading || supplierLoading) return <Loading />;

  const totalItems =
    (isUserTab ? userReturns : supplierReturns)?.reduce(
      (acc: any, item: any) =>
        acc +
        item.detail_return.reduce(
          (sum: any, detail: any) => sum + detail.jumlah_return,
          0
        ),
      0
    ) || 0;

  return (
    <>
      <div className="border-b border-gray-200">
        <nav
          className="-mb-0.5 flex justify-center space-x-6"
          aria-label="Tabs"
          role="tablist"
        >
          <button
            type="button"
            className={`hs-tab-active:font-semibold w-full hs-tab-active:border-brand-600 hs-tab-active:text-brand-600 py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none ${
              isUserTab && "active"
            }`}
            id="horizontal-alignment-item-1"
            data-hs-tab="#horizontal-alignment-1"
            aria-controls="horizontal-alignment-1"
            role="tab"
            onClick={() => setIsUserTab(true)}
          >
            History Return Konsumen
          </button>
          <button
            type="button"
            className={`hs-tab-active:font-semibold w-full hs-tab-active:border-brand-600 hs-tab-active:text-brand-600 py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none ${
              !isUserTab && "active"
            }`}
            id="horizontal-alignment-item-2"
            data-hs-tab="#horizontal-alignment-2"
            aria-controls="horizontal-alignment-2"
            role="tab"
            onClick={() => setIsUserTab(false)}
          >
            History Return Supplier
          </button>
        </nav>
      </div>

      <div className="mt-8">
        <Table
          className="text-black"
          tableClassName="max-h-[45vh]"
          data={isUserTab ? userReturns || [] : supplierReturns || []}
          columns={
            (isUserTab
              ? UserReturnColumns
              : SupplierReturnColumns) as ColumnDef<ColumnsType>[]
          }
          columnToggle={{
            enabled: true,
            title: "Tampilkan",
            className: "overflow-y-auto max-h-[350px]",
          }}
          isLoading={isUserTab ? userLoading : supplierLoading}
          footers={<>Total Item: {totalItems}</>}
          withFilter
          extras={
            <div className="flex justify-end items-center mt-5 gap-x-3">
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="flex w-fit rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600"
                />
                <span>-</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="flex w-fit rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600"
                />
              </div>
              <Dropdown
                type="base"
                sizes={["DD/MM/YYYY", "XX Hari"]}
                title="Pilih Format Tanggal"
                onFormatChange={setDateFormat}
              />
            </div>
          }
        />
      </div>
    </>
  );
}
