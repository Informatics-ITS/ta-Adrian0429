"use client";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import Button from "@/app/components/button/Button";
import Dropdown2 from "@/app/components/Dropdown2";
import DatePicker from "@/app/components/Forms/Datepicker";
import Input from "@/app/components/Forms/Input";
import React, { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import withAuth from "@/app/components/hoc/withAuth";
import { AddPasswordModal } from "@/app/(owner)/karyawan/modal/passwordModal";
import { useDisclosure } from "@nextui-org/modal";
import { AddKaryawanData, KaryawanData } from "@/types/karyawan";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { CancelModal } from "@/app/components/modal/variants/cancelModal";

const breadCrumbs = [
  { href: "/karyawan", Title: "Karyawan" },
  { href: "/karyawan/edit", Title: "Form Edit Karyawan" },
];

type ModalReturnType = {
  openModal: () => void;
};

export default withAuth(EditKaryawan, "admin");
function EditKaryawan() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const modalReturn: ModalReturnType = {
    openModal: onOpen,
  };

  const [response, setResponse] = useState("not submitted");
  const isPending = false;

  const methods = useForm<AddKaryawanData>({
    mode: "onChange",
  });

  const path = usePathname();
  const pathSegments = path.split("/");
  const pathId = pathSegments[pathSegments.length - 2];

  const { data } = useQuery({
    queryKey: ["karyawan"],
    queryFn: async () => {
      const response = await api.get(`/api/user/${pathId}`);
      return response;
    },
  });

  const karyawan = data?.data.data;

  const formatDate = (dateStr: string): string | undefined => {
    if (!dateStr) return undefined;

    const date = new Date(`${dateStr}T00:00:00.000Z`);

    return date.toISOString();
  };

  const { reset, handleSubmit } = methods;

  const updateMutation = useMutation({
    mutationFn: async (updatedData: AddKaryawanData) => {
      return await api.patch(`/api/user/${pathId}`, updatedData);
    },
    onSuccess: () => {
      toast.success("Berhasil mengupdate data karyawan!");
      setResponse("submitted");
      onClose();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit: SubmitHandler<AddKaryawanData> = (data) => {
    const { confirmPassword, ...payload } = data;
    updateMutation.mutate(payload);
    return;
  };

  return (
    <div className="h-nav px-8 py-4">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <h1 className="text-H1">Form Edit Karyawan</h1>

      <div className="w-full mt-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
            <div className="flex flex-row space-x-32">
              <div className="w-full space-y-5">
                <Input
                  type="text"
                  id="nik"
                  label={"NIK"}
                  placeholder="3317xxxxxxx"
                  defaultValue={karyawan?.nik}
                  validation={{ required: "NIK Karyawan Harus Diisi" }}
                />

                <Input
                  type="text"
                  id="name"
                  label={"Nama Karyawan"}
                  placeholder="Budi Santoso"
                  defaultValue={karyawan?.name}
                  validation={{ required: "Nama Karyawan Harus Diisi" }}
                />

                <Input
                  type="email"
                  id="email"
                  label={"Email Karyawan"}
                  placeholder="BudiSantoso@gmail.com"
                  defaultValue={karyawan?.email}
                  validation={{
                    pattern: {
                      value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Email tidak valid",
                    },
                    required: "Email Karyawan Harus Diisi",
                  }}
                />

                <Input
                  type="text"
                  id="no_hp"
                  label={"No. Handphone"}
                  placeholder="ex. 08123456789"
                  defaultValue={karyawan?.no_hp}
                  validation={{ required: "Nama Karyawan Harus Diisi" }}
                />
                <div>
                  <p className="text-S2 mb-3">Bagian Karyawan</p>
                  <Dropdown2
                    id="role"
                    title="Bagian Karyawan"
                    defaultValue={karyawan?.role}
                    contents={["Kasir", "Stok", "Kasir & Stok"]}
                    errorMessage="Bagian Karyawan Harus Diisi"
                  />
                </div>
              </div>

              <div className="flex flex-col w-full space-y-5">
                <Input
                  type="text"
                  id="tempat_lahir"
                  label={"Tempat Lahir"}
                  placeholder="ex: Surabaya"
                  defaultValue={karyawan?.tempat_lahir}
                  validation={{ required: "Tempat Lahir harus diisi" }}
                />

                <DatePicker
                  id="tanggal_lahir"
                  label="Tanggal Lahir"
                  placeholder="dd-mm-yyyy"
                  format="dd-MM-yyyy"
                  defaultValue={formatDate(karyawan?.tanggal_lahir)}
                  validation={{
                    required: "Tanggal Lahir Harus Diisi",
                    valueAsDate: true,
                  }}
                  containerClassName="w-full"
                />

                <Input
                  type="text"
                  id="alamat"
                  label={"Alamat"}
                  placeholder="ex: Jalan Kertajaya"
                  defaultValue={karyawan?.alamat}
                  validation={{ required: "Alamat harus diisi" }}
                />

                <DatePicker
                  id="tanggal_masuk"
                  label="Tanggal Masuk"
                  placeholder="dd-mm-yyyy"
                  format="dd-MM-yyyy"
                  defaultValue={formatDate(karyawan?.tanggal_masuk)}
                  validation={{
                    required: "Tanggal Masuk Harus Diisi",
                    valueAsDate: true,
                  }}
                  containerClassName="w-full"
                />
                <div className="flex flex-row items-end pt-16 space-x-[10px] justify-end">
                  <CancelModal path="/karyawan">
                    {({ openModal }) => (
                      <Button variant="outline primary" onClick={openModal}>
                        Batal
                      </Button>
                    )}
                  </CancelModal>
                  <AddPasswordModal
                    onSubmit={handleSubmit(onSubmit)}
                    handleSubmit={handleSubmit}
                    isLoading={isPending}
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
                      >
                        Tambah Kata Sandi
                      </Button>
                    )}
                  </AddPasswordModal>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
