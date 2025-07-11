"use client";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import Button from "@/app/components/button/Button";
import Input from "@/app/components/Forms/Input";
import React, { useState } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

import { ApiError } from "@/types/api";
import toast from "react-hot-toast";
import api from "@/lib/api";
import TextArea from "@/app/components/Forms/TextArea";
import withAuth from "@/app/components/hoc/withAuth";
import { SubmitModal } from "@/app/components/modal/variants/submitModal";
import { CancelModal } from "@/app/components/modal/variants/cancelModal";

const breadCrumbs = [
  { href: "/cv", Title: "CV" },
  { href: "/cv/tambah", Title: "Form Tambah CV" },
];

export type CVDatas = {
  name: string;
  alamat: string;
  keterangan: string;
};

export default withAuth(TambahCV, "admin");
function TambahCV() {
  const methods = useForm<CVDatas>({
    mode: "onChange",
  });

  const { reset, handleSubmit } = methods;

  const [response, setResponse] = useState("not submitted");

  const { mutate: CVMutation, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    CVDatas
  >({
    mutationFn: async (data: CVDatas) => {
      return await api.post("/api/cabang", data);
    },
    onSuccess: () => {
      toast.success("Berhasil menambahkan CV baru!");
      setResponse("submitted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit: SubmitHandler<CVDatas> = (data) => {
    CVMutation(data);
    return;
  };
  return (
    <div className="h-nav px-8 py-4">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <h1 className="text-H1">Form Tambah CV</h1>

      <div className="w-full mt-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
            <div className="flex flex-col space-y-5">
              <Input
                type="text"
                id="name"
                label={"Nama CV"}
                placeholder="CV Bahagia"
                validation={{ required: "Nama Harus Diisi" }}
              />

              <Input
                type="text"
                id="alamat"
                label={"Alamat CV"}
                placeholder="Jalan Medan"
                validation={{ required: "Alamat Harus Diisi" }}
              />
            </div>

            <div className="h-[30vh] mt-5 space-y-3">
              <TextArea
                id="keterangan"
                placeholder="Keterangan CV"
                label={"Keterangan CV"}
                validation={{ required: "Keterangan Harus Diisi" }}
              />
              <div className="flex justify-end gap-[10px]">
                <CancelModal path="/cv">
                  {({ openModal }) => (
                    <Button variant="outline primary" onClick={openModal}>
                      Batal
                    </Button>
                  )}
                </CancelModal>
                <SubmitModal
                  message="Data CV berhasil Disimpan!"
                  path="/cv"
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
