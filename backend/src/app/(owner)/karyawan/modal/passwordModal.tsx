"use client";
import { useDisclosure } from "@nextui-org/modal";
import React from "react";
import Button from "@/app/components/button/Button";
import Modal from "@/app/components/modal/Modal";
import Input from "@/app/components/Forms/Input";

import { SubmitKaryawanModal } from "./submitModal";

type ModalReturnType = {
  openModal: () => void;
};

export function AddPasswordModal({
  children,
  isLoading,
  onSubmit,
  handleSubmit,
  onReset,
  response,
}: {
  children: (props: ModalReturnType) => JSX.Element;
  onSubmit: () => void;
  handleSubmit: any;
  onReset: () => void;
  isLoading: any;
  response: string;
}) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const modalReturn: ModalReturnType = {
    openModal: onOpen,
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
        className="w-[500px] flex mx-auto border-none"
      >
        <Modal.Header
          className="flex mt-[30px] px-[30px]"
          onClose={onClose}
          buttonCrossClassName="hidden"
        >
          Tambah Kata Sandi
        </Modal.Header>

        <Modal.Body className="text-left px-[30px] mt-[30px]">
          <div className="flex flex-col space-y-5 mb-2">
            <Input
              type="password"
              id="password"
              label="Kata Sandi"
              placeholder="Masukkan Kata Sandi"
              validation={{
                required: "Kata Sandi Harus Diisi",
                minLength: {
                  value: 6,
                  message: "Kata Sandi Minimal 6 Karakter",
                },
              }}
            />
            <Input
              type="password"
              id="confirmPassword"
              label="Konfirmasi Kata Sandi"
              placeholder="Masukkan Konfirmasi Kata Sandi"
              validation={{
                required: "Konfirmasi Kata Sandi harus diisi",
                validate: (value, { password }) =>
                  value === password || "Kata Sandi Tidak Cocok",
              }}
            />
          </div>
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
            <SubmitKaryawanModal
              onSubmit={onSubmit}
              onReset={onReset}
              response={response}
            >
              {({ openModal }) => (
                <Button
                  variant="primary"
                  size="base"
                  onClick={handleSubmit(() => {
                    openModal();
                  })}
                  isLoading={isLoading}
                  className="w-1/2"
                >
                  Simpan
                </Button>
              )}
            </SubmitKaryawanModal>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
