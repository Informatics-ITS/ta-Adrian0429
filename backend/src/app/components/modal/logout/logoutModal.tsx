"use client";
import { useDisclosure } from "@nextui-org/modal";
import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "@/app/components/button/Button";
import Modal from "@/app/components/modal/Modal";
import { removeToken } from "@/lib/cookies";
import { useRouter } from "next/navigation";

type ModalReturnType = {
  openModal: () => void;
};

export function LogOut({
  children,
}: {
  children: (props: ModalReturnType) => JSX.Element;
}) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const modalReturn: ModalReturnType = {
    openModal: onOpen,
  };

  const router = useRouter();

  return (
    <>
      {children(modalReturn)}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="opaque"
        backdropClassName="bg-[#17171F] bg-opacity-60"
        className="w-[400px] flex mx-auto border-none"
      >
        <Modal.Header
          className="flex justify-center mt-10"
          onClose={onClose}
          buttonCrossClassName="mt-[10px] mr-[10px]"
        >
          <div className="rounded-full p-2 bg-danger-100">
            <div className="p-2 rounded-full bg-danger-200">
              <FiAlertTriangle className="text-2xl text-danger-700" />
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="text-center px-10 mt-5">
          <h1 className="text-H1 text-[#1F2937]">Peringatan!</h1>
          <p className="text-S1 text-[#6B7280]">
            Apakah anda yakin ingin log out?
          </p>
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
            <Button
              variant="outline primary"
              size="base"
              className="min-h-8 max-w-24 px-9 py-0.5"
              onClick={() => {
                removeToken();
                onClose();
                router.push("/");
              }}
            >
              Ya
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
