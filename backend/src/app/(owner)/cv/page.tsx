"use client";
import Button from "@/app/components/button/Button";
import Link from "next/link";
import React from "react";
import { FiDownload, FiPlus } from "react-icons/fi";
import { CVDeleteModal } from "./modal/deleteModal";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { EditCVModal } from "./modal/editCVModal";
import withAuth from "@/app/components/hoc/withAuth";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@/app/components/table/Table";

export type SearchPengeluaran = {
  title: string;
};

type CVData = {
  id: string;
  name: string;
  alamat: string;
  keterangan: string;
};

export default withAuth(CV, "admin");
function CV() {
  const {
    data,
    refetch: refetchCabang,
    isLoading,
  } = useQuery({
    queryKey: ["cabang"],
    queryFn: async () => {
      const response = await api.get("/api/cabang", {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response;
    },
  });

  const cv = data?.data.data.data || [];

  const downloadQuery = useQuery({
    queryKey: ["download"],
    queryFn: async () => {
      const response = await api.get("/api/cabang/download", {
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
      link.download = "Data CV.xlsx";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh data");
    }
  };

  const columns: ColumnDef<CVData>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama CV",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "alamat",
      header: "Alamat CV",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        return (
          <div className="flex flex-row justify-center gap-[5px]">
            <EditCVModal data={row.original} refetch={refetchCabang}>
              {({ openModal }) => (
                <Button size="small" variant="warning" onClick={openModal}>
                  Edit
                </Button>
              )}
            </EditCVModal>
            <CVDeleteModal cvId={row.original.id} refetch={refetchCabang}>
              {({ openModal }) => (
                <Button size="small" variant="danger" onClick={openModal}>
                  Hapus
                </Button>
              )}
            </CVDeleteModal>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-nav px-8 py-4 overflow-y-scroll">
      <h1 className="text-H1">CV</h1>
      <Table
        className="text-black mt-8"
        data={cv}
        columns={columns}
        isLoading={isLoading}
        footers={<>Total CV: {cv.length}</>}
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
            <Link href="/cv/tambah">
              <Button size="base" leftIcon={FiPlus}>
                Tambah CV
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
