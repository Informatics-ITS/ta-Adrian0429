"use client";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import Button from "@/app/components/button/Button";
import Dropdown2 from "@/app/components/Dropdown2";
import DatePicker from "@/app/components/Forms/Datepicker";
import Input from "@/app/components/Forms/Input";
import TextArea from "@/app/components/Forms/TextArea";
import withAuth from "@/app/components/hoc/withAuth";
import { CancelModal } from "@/app/components/modal/variants/cancelModal";
import { SubmitModal } from "@/app/components/modal/variants/submitModal";
import api from "@/lib/api";
import { ApiError } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import React, { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const breadCrumbs = [
  { href: "/dashboard", Title: "Dashboard" },
  { href: "/pengeluaran", Title: "Pengeluaran" },
  { href: "/tambah-pengeluaran", Title: "Tambah Pengeluaran" },
];

type AddPengeluaranData = {
  nama_pengeluaran: string;
  tipe_pembayaran: string;
  tanggal_pengeluaran: string;
  description: string;
  kategori_pengeluaran: string;
  jumlah: number;
  tujuan: string;
};

export default withAuth(TambahPengeluaran, "admin");
function TambahPengeluaran() {
  const methods = useForm<AddPengeluaranData>({
    mode: "onChange",
  });

  const { reset, handleSubmit } = methods;

  const [response, setResponse] = useState("not submitted");

  const { mutate: PengeluaranMutation, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    AddPengeluaranData
  >({
    mutationFn: async (data: AddPengeluaranData) => {
      return await api.post("/api/pengeluaran", data);
    },
    onSuccess: () => {
      toast.success("Berhasil menambahkan pengeluaran baru!");
      setResponse("submitted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit: SubmitHandler<AddPengeluaranData> = (data) => {
    const transformedData = {
      ...data,
      jumlah: parseFloat(String(data.jumlah).replace(/\./g, "")),
    };

    PengeluaranMutation(transformedData);
    return;
  };

  return (
    <div className="h-nav px-8 py-4">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <h1 className="text-H1">Tambah Pengeluaran</h1>

      <div className="w-full mt-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
            <div className="flex flex-row space-x-32">
              <div className="w-full space-y-5">
                <Input
                  type="text"
                  id="nama_pengeluaran"
                  label={"Nama Pengeluaran"}
                  placeholder="ex. Pembelian Baju"
                  validation={{ required: "Nama Pengeluaran harus diisi" }}
                />

                <DatePicker
                  id="tanggal_pengeluaran"
                  label="Tanggal Pengeluaran"
                  placeholder="dd-mm-yyyy"
                  format="dd-MM-yyyy"
                  validation={{
                    required: "Tanggal Pengeluaran Harus Diisi",
                    valueAsDate: true,
                  }}
                  containerClassName="w-full"
                />

                <Input
                  type="number"
                  id="jumlah"
                  formatNumber
                  label={"Jumlah Pengeluaran"}
                  placeholder="100.000"
                  leftIcon={"Rp."}
                  validation={{
                    required: "Jumlah Pengeluaran harus diisi",
                  }}
                />
              </div>

              <div className="flex flex-col w-full space-y-[15px]">
                <p className="text-S2 -mb-1">Kategori Pengeluaran</p>
                <Dropdown2
                  id="kategori_pengeluaran"
                  title="Kategori Pengeluaran"
                  contents={[
                    "Tagihan",
                    "Kecantikan",
                    "Pendidikan",
                    "Operasional",
                    "Lainnya",
                  ]}
                  errorMessage="Kategori Pengeluaran harus diisi"
                />
                <p className="text-S2 -mb-1">Metode Pengeluaran</p>
                <Dropdown2
                  id="tipe_pembayaran"
                  title="Metode Pembayaran"
                  contents={["Debit", "Tunai", "QRIS"]}
                  errorMessage="Metode Pembayaran harus diisi"
                />

                <Input
                  type="text"
                  id="tujuan"
                  label={"Tujuan Pengeluaran"}
                  placeholder="PT. ABC"
                  validation={{ required: "Tujuan Pengeluaran harus diisi" }}
                />
              </div>
            </div>

            <div className="h-[28vh] mt-5 space-y-3">
              <TextArea
                id="description"
                placeholder="Keterangan Pengeluaran"
                label={"Keterangan Pengeluaran"}
                validation={{ required: "Keterangan Harus Diisi" }}
              />
              <div className="flex flex-row justify-end space-x-4 pb-3">
                <CancelModal path="/pengeluaran">
                  {({ openModal }) => (
                    <Button variant="outline primary" onClick={openModal}>
                      Batal
                    </Button>
                  )}
                </CancelModal>
                <SubmitModal
                  message="Pengeluaran Berhasil Disimpan"
                  path="/pengeluaran"
                  onSubmit={handleSubmit(onSubmit)}
                  onReset={reset}
                  response={response}
                >
                  {({ openModal }) => (
                    <Button
                      variant="primary"
                      size="base"
                      onClick={handleSubmit(() => {
                        openModal();
                      })}
                      isLoading={isPending}
                      type="submit"
                    >
                      Simpan
                    </Button>
                  )}
                </SubmitModal>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
