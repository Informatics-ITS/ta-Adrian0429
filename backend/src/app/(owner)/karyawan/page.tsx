"use client";
import Button from "@/app/components/button/Button";
import Card from "@/app/components/card/Card";
import Input from "../../components/Forms/Input";
import Link from "next/link";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FiDownload, FiPlus, FiSearch } from "react-icons/fi";
import withAuth from "@/app/components/hoc/withAuth";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { KaryawanData } from "@/types/karyawan";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@/app/components/table/Table";
import { fdatasync } from "fs";
import Loading from "@/app/components/Loading";

export type SearchKaryawan = {
  title: string;
};

export default withAuth(Karyawan, "admin");
function Karyawan() {
  const { data, isLoading } = useQuery({
    queryKey: ["karyawan"],
    queryFn: async () => {
      const response = await api.get(`/api/user`);
      return response;
    },
  });
  const karyawan = isLoading
    ? []
    : data?.data?.data?.data?.map((karyawan: { id: any }) => ({
        ...karyawan,
        href: `/karyawan/${karyawan.id}`,
      })) || [];

  const downloadQuery = useQuery({
    queryKey: ["download"],
    queryFn: async () => {
      const response = await api.get("/api/user/download", {
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
      link.download = "Data Karyawan.xlsx";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh data");
    }
  };

  function parseDate(datetimeString: string) {
    const dateTimeParts = datetimeString.split(" ");
    const datePart = dateTimeParts.slice(0, 3).join(" ");

    const dateObject = new Date(datePart);

    if (isNaN(dateObject.getTime())) {
      console.error("Invalid date:", datePart);
      return "";
    }

    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  }

  const columns: ColumnDef<KaryawanData>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableHiding: false,
      cell: (props) => <span>{`${props.getValue()}`}</span>,
    },
    {
      accessorKey: "nik",
      header: "NIK",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "name",
      header: "Nama Karyawan",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "no_hp",
      header: "No Telepon",
      cell: (props) => <span>{`${props.getValue()}`}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "tanggal_masuk",
      header: "Tanggal Masuk",
      cell: (props) => <span>{parseDate(props.getValue() as string)}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (props) => (
        <span>{`${
          props.getValue() == "kasirstok" ? "Kasir & Stok" : props.getValue()
        }`}</span>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-nav justify-between px-8 py-4">
      <h1 className="text-H1">DAFTAR KARYAWAN</h1>

      <div className="flex flex-row justify-between mt-5 gap-x-20">
        <Card title="Karyawan Aktif" content={data?.data.data.total_karyawan} />
        <Card title="Karyawan Kasir" content={data?.data.data.total_kasir} />
        <Card title="Karyawan Stok" content={data?.data.data.total_stok} />
      </div>

      <Table
        className="text-black mt-8"
        tableClassName="max-h-[50vh]"
        data={karyawan}
        columns={columns}
        columnToggle={{
          enabled: true,
          title: "Tampilkan",
        }}
        isLoading={isLoading}
        footers={<>Jumlah Karyawan: {karyawan.length}</>}
        extras={
          <div className="flex flex-row justify-end items-center space-x-4 w-full">
            <Button
              size="base"
              variant="outline"
              leftIcon={FiDownload}
              onClick={handleDownload}
              disabled={isFetching}
            >
              {isFetching ? "Mengunduh..." : "Unduh Data"}
            </Button>
            <Link href="/karyawan/tambah">
              <Button size="base" leftIcon={FiPlus}>
                Tambah Karyawan
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
