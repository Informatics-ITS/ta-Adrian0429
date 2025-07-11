"use client";
import { useDisclosure } from "@nextui-org/modal";
import React, { useState } from "react";
import Button from "@/app/components/button/Button";
import Modal from "@/app/components/modal/Modal";
import Input from "@/app/components/Forms/Input";

import { FormProvider, useForm } from "react-hook-form";
import TextArea from "@/app/components/Forms/TextArea";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { SubmitModal } from "@/app/components/modal/variants/submitModal";

type ModalReturnType = {
  openModal: () => void;
};

type CVData = {
  id: string;
  name: string;
  alamat: string;
  keterangan: string;
};

export function EditCVModal({
  children,
  data,
  refetch,
}: {
  children: (props: ModalReturnType) => JSX.Element;
  data: any;
  refetch: () => void;
}) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const modalReturn: ModalReturnType = {
    openModal: onOpen,
  };

  const [response, setResponse] = useState("not submitted");
  const isPending = false;

  const methods = useForm<CVData>({
    mode: "onChange",
  });

  const { reset, handleSubmit } = methods;

  const updateMutation = useMutation({
    mutationFn: async (updatedData: CVData) => {
      return await api.patch(`/api/cabang/${data.id}`, updatedData);
    },
    onSuccess: () => {
      toast.success("Berhasil mengupdate data CV!");
      setResponse("submitted");
      onClose();
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (formData: CVData) => {
    updateMutation.mutate(formData);
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
        className="w-[400px] flex mx-auto border-none"
      >
        <Modal.Header
          className="flex mt-[30px] px-[30px]"
          onClose={onClose}
          buttonCrossClassName="hidden"
        >
          Ubah Data CV
        </Modal.Header>

        <Modal.Body className="text-left px-[30px] mt-[30px]">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 h-full mb-12"
            >
              <div className="flex flex-col space-y-5">
                <Input
                  type="text"
                  id="name"
                  label={"Nama CV"}
                  placeholder={data.name}
                  defaultValue={data.name}
                  validation={{ required: "Nama Harus Diisi" }}
                />

                <Input
                  type="text"
                  id="alamat"
                  label={"Alamat CV"}
                  placeholder="Jalan Medan"
                  defaultValue={data.alamat}
                  validation={{ required: "Alamat Harus Diisi" }}
                />
              </div>

              <div className="h-[30vh] mt-5 space-y-3">
                <TextArea
                  id="keterangan"
                  placeholder="Keterangan CV"
                  label={"Keterangan CV"}
                  defaultValue={data.keterangan}
                  validation={{ required: "Keterangan Harus Diisi" }}
                />
              </div>
            </form>
          </FormProvider>
        </Modal.Body>

        <Modal.Footer className="mt-5 mb-8">
          <div className="flex w-full justify-center gap-[10px] px-[30px]">
            <Button
              variant="outline primary"
              size="base"
              onClick={onClose}
              className="w-1/2"
            >
              Batal
            </Button>
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
                  className="w-1/2"
                >
                  Simpan
                </Button>
              )}
            </SubmitModal>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
