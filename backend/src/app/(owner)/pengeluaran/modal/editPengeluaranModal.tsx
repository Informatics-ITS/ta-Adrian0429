"use client";
import { useDisclosure } from "@nextui-org/modal";
import React from "react";
import Button from "@/app/components/button/Button";
import Modal from "@/app/components/modal/Modal";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Forms/Input";
import DatePicker from "@/app/components/Forms/Datepicker";
import { useState } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { PengeluaranData } from "@/app/(owner)/pengeluaran/PengeluaranTabs";
import { AxiosError, AxiosResponse } from "axios";
import { ApiError } from "@/types/api";
import toast from "react-hot-toast";
import { SubmitModal } from "@/app/components/modal/variants/submitModal";
import TextArea from "@/app/components/Forms/TextArea";
import Dropdown2 from "@/app/components/Dropdown2";

type ModalReturnType = {
  openModal: () => void;
};

export function EditPengeluaranModal({
  children,
  closeModal,
  data,
}: {
  children: (props: ModalReturnType) => JSX.Element;
  closeModal: () => void;
  data: PengeluaranData;
}) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const modalReturn: ModalReturnType = {
    openModal: onOpen,
  };

  const router = useRouter();

  const methods = useForm<PengeluaranData>({
    mode: "onChange",
  });

  const { reset, handleSubmit, control, register } = methods;

  const [response, setResponse] = useState("not submitted");

  const { mutate: PengeluaranMutation, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    PengeluaranData
  >({
    mutationFn: async (formData: PengeluaranData) => {
      return await api.patch(`/api/pengeluaran/${data.id}`, formData);
    },
    onSuccess: () => {
      toast.success("Berhasil mengubah data pengeluaran!");
      setResponse("submitted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit: SubmitHandler<PengeluaranData> = (formData) => {
    const transformedData = {
      ...formData,
      jumlah: parseFloat(formData.jumlah as unknown as string),
    };
    PengeluaranMutation(transformedData);
    return;
  };

  return (
    <>
      {children(modalReturn)}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="opaque"
        scrollBehavior="inside"
        backdropClassName="bg-[#17171F] bg-opacity-60"
        className="w-[700px] flex mx-auto border-none"
      >
        <Modal.Header
          className="flex justify-center mt-10"
          onClose={onClose}
          buttonCrossClassName="mt-[10px] mr-[10px]"
        >
          Edit Pengeluaran
        </Modal.Header>

        <Modal.Body className="text-left px-10 mt-5">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 max-h-[calc(100vh-300px)]"
            >
              <Input
                type="text"
                id="nama_pengeluaran"
                defaultValue={data.nama_pengeluaran}
                label={"Nama Pengeluaran"}
                placeholder="ex. Pembelian Baju"
                validation={{ required: "Nama Pengeluaran harus diisi" }}
              />

              <DatePicker
                id="tanggal_pengeluaran"
                label="Tanggal Pengeluaran"
                placeholder="dd-mm-yyyy"
                defaultValue={data.tanggal_pengeluaran}
                format="dd-MM-yyyy"
                validation={{
                  required: "Jumlah Pengeluaran Harus Diisi",
                  valueAsDate: true,
                }}
                containerClassName="w-full"
              />

              <Input
                type="number"
                id="jumlah"
                defaultValue={data.jumlah}
                label={"Jumlah Pengeluaran"}
                placeholder="100.000"
                leftIcon={"Rp."}
                validation={{
                  required: "Jumlah Pengeluaran harus diisi",
                  valueAsNumber: true,
                }}
              />

              <p className="text-S2 -mb-1">Kategori Pengeluaran</p>
              <Dropdown2
                id="kategori_pengeluaran"
                title="Kategori Pengeluaran"
                defaultValue={data.kategori_pengeluaran}
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
                defaultValue={data.tipe_pembayaran}
                contents={["Debit", "Tunai", "QRIS"]}
                errorMessage="Metode Pembayaran harus diisi"
              />

              <Input
                type="text"
                id="tujuan"
                defaultValue={data.tujuan}
                label={"Tujuan Pengeluaran"}
                placeholder="PT. ABC"
                validation={{ required: "Tujuan Pengeluaran harus diisi" }}
              />

              <TextArea
                id="description"
                defaultValue={data.description}
                placeholder="Keterangan Pengeluaran"
                label={"Keterangan Pengeluaran"}
                validation={{ required: "Keterangan Harus Diisi" }}
              />
            </form>
          </FormProvider>
        </Modal.Body>

        <Modal.Footer className="mt-5 mb-8">
          <div className="flex justify-center gap-4">
            <Button
              variant="primary"
              size="base"
              className="min-h-8 max-w-24 px-9 py-0.5"
              onClick={onClose}
            >
              Tidak
            </Button>

            <SubmitModal
              onSubmit={handleSubmit(onSubmit)}
              onReset={reset}
              path="/pengeluaran"
              message="Data Pengeluaran Berhasil Disimpan!"
              response={response}
              closeModal={closeModal}
            >
              {({ openModal }) => (
                <Button
                  variant="outline primary"
                  size="base"
                  type="submit"
                  isLoading={isPending}
                  className="min-h-8 max-w-24 px-9 py-0.5"
                  onClick={handleSubmit(() => {
                    openModal();
                  })}
                >
                  Ya
                </Button>
              )}
            </SubmitModal>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
