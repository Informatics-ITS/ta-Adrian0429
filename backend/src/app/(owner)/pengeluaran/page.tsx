"use client";
import Button from "@/app/components/button/Button";
import Card from "@/app/components/card/Card";
import Input from "../../components/Forms/Input";
import Tab from "@/app/(owner)/pengeluaran/PengeluaranTabs";
import Link from "next/link";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FiDownload, FiPlus, FiSearch } from "react-icons/fi";
import withAuth from "@/app/components/hoc/withAuth";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export type SearchPengeluaran = {
  title: string;
};

export default withAuth(Pegeluaran, "admin");
function Pegeluaran() {
  const methods = useForm<SearchPengeluaran>({
    mode: "onChange",
  });

  const { data, refetch: refetchPengeluaran } = useQuery({
    queryKey: ["pengeluaran"],
    queryFn: async () => {
      const response = await api.get("/api/pengeluaran");
      return response.data;
    },
  });

  const dataIndex = data?.data.data_index;

  const downloadQuery = useQuery({
    queryKey: ["download"],
    queryFn: async () => {
      const response = await api.get("/api/pengeluaran/download", {
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
      link.download = "Data Pengeluaran.xlsx";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh data");
    }
  };

  const { handleSubmit } = methods;

  const onSubmit = (data: SearchPengeluaran) => {
    console.log(data);
  };

  return (
    <div className="h-nav justify-between px-8 py-4">
      <h1 className="text-H1">CATATAN PENGELUARAN</h1>

      <div className="flex flex-row justify-between mt-5 gap-x-10">
        <Card
          title="Hari ini"
          content={dataIndex?.daily.toLocaleString("id-ID")}
        />
        <Card
          title="Bulan ini"
          content={dataIndex?.monthly.toLocaleString("id-ID")}
        />
        <Card
          title="Tahun ini"
          content={dataIndex?.yearly.toLocaleString("id-ID")}
        />
      </div>

      <div className="flex justify-between mt-8">
        <div className="w-full">
          <FormProvider {...methods}>
            <form className="w-[50%]">
              <Input
                type="text"
                id="title"
                label={""}
                placeholder="cari disini"
                leftIcon={FiSearch}
              />
            </form>
          </FormProvider>
        </div>

        <div className="flex flex-row justify-end items-center space-x-4 w-full">
          <Button
            size="large"
            variant="outline"
            leftIcon={FiDownload}
            onClick={handleDownload}
            disabled={isFetching}
          >
            {isFetching ? "Mengunduh..." : "Unduh Data"}
          </Button>
          <Link href="/pengeluaran/tambah">
            <Button size="large" leftIcon={FiPlus}>
              Tambah Catatan
            </Button>
          </Link>
        </div>
      </div>

      <Tab />
    </div>
  );
}
