"use client";
import Button from "@/app/components/button/Button";
import Link from "next/link";
import React from "react";
import { FiDownload, FiPlus } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import withAuth from "@/app/components/hoc/withAuth";
import toast from "react-hot-toast";
import Table from "@/app/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";

type SupplierData = {
  id: number;
  name: string;
  no_hp: string;
  discount: number;
  merk: string | null;
};

export default withAuth(Supplier, "admin");
function Supplier() {
  const { data, isLoading } = useQuery({
    queryKey: ["supplier"],
    queryFn: async () => {
      const response = await api.get("/api/supplier");
      return response.data;
    },
  });

  const suppliers =
    data?.data?.data?.map((supplier: { id: any }) => ({
      ...supplier,
      href: `/supplier/${supplier.id}`,
    })) || [];

  const downloadQuery = useQuery({
    queryKey: ["download"],
    queryFn: async () => {
      const response = await api.get("/api/supplier/download", {
        responseType: "blob",
      });
      return response.data;
    },
    enabled: false,
  });

  const { refetch: refetchDownload, isFetching } = downloadQuery;

  const handleDownload = async () => {
    try {
      const fileData = await refetchDownload();

      const blob = new Blob([fileData.data], { type: fileData.data.type });
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "Data Supplier.xlsx";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh data");
    }
  };

  const columns: ColumnDef<SupplierData>[] = [
    {
      accessorKey: "id",
      header: "ID Supplier",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "no_hp",
      header: "Nomor Telepon",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: (props) => <span>{`${props.getValue()} %`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
  ];

  return (
    <div className="h-nav px-8 py-4 overflow-y-auto">
      <h1 className="text-H1">Supplier</h1>
      <Table
        className="text-black mt-8"
        data={suppliers}
        columns={columns}
        isLoading={isLoading}
        footers={<>Total Supplier: {suppliers.length}</>}
        extras={
          <div className="flex flex-row justify-end space-x-4 w-full items-end">
            <Button
              size="base"
              variant="outline"
              leftIcon={FiDownload}
              onClick={handleDownload}
              disabled={isFetching}
            >
              {isFetching ? "Mengunduh..." : "Unduh Data"}
            </Button>

            <Link href="/supplier/tambah">
              <Button size="base" leftIcon={FiPlus}>
                Tambah Supplier
              </Button>
            </Link>
          </div>
        }
        withFilter
        withLink
      />
    </div>
  );
}
