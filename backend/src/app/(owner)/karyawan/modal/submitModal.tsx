"use client";
import { useDisclosure } from "@nextui-org/modal";
import React, { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "@/app/components/button/Button";
import Modal from "@/app/components/modal/Modal";
import { BsCheck2Circle } from "react-icons/bs";
import { useRouter } from "next/navigation";

type ModalReturnType = {
  openModal: () => void;
};

export function SubmitKaryawanModal({
  children,
  onSubmit,
  onReset,
  response,
}: {
  children: (props: ModalReturnType) => JSX.Element;
  onSubmit: () => void;
  onReset: () => void;
  response: string;
}) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const modalReturn: ModalReturnType = {
    openModal: onOpen,
  };

  const router = useRouter();

  useEffect(() => {
    if (response === "submitted") {
      onOpen();
      setIsSubmitted(true);
    }
  }, [response, onOpen]);

  const handleformsubmit = () => {
    onSubmit();
  };

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
          onClose={() => {
            onClose();
            setIsSubmitted(false);
          }}
          buttonCrossClassName="mt-[10px] mr-[10px]"
        >
          {isSubmitted ? (
            <div className="rounded-full p-2 bg-success-100">
              <div className="p-2 rounded-full bg-success-200">
                <BsCheck2Circle className="text-2xl text-success-700" />
              </div>
            </div>
          ) : (
            <div className="rounded-full p-2 bg-warning-100">
              <div className="p-2 rounded-full bg-warning-200">
                <FiAlertTriangle className="text-2xl text-warning-700" />
              </div>
            </div>
          )}
        </Modal.Header>

        <Modal.Body className="text-center px-10 mt-5">
          {isSubmitted ? (
            <>
              <h1 className="text-H1 text-[#1F2937]">
                Data Karyawan berhasil Disimpan!
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-H1 text-[#1F2937]">Konfirmasi</h1>
              <p className="text-S1 text-[#6B7280] mt-[10px]">
                Pastikan data yang dimasukkan sudah benar!
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="mt-5 mb-8">
          <div className="flex justify-center gap-4">
            <Button
              variant="primary"
              size="base"
              className="min-h-8 max-w-24 px-9 py-0.5"
              onClick={() => {
                onClose();
                {
                  isSubmitted && onReset();
                  isSubmitted && router.push("/karyawan");
                }
              }}
            >
              Kembali
            </Button>
            {!isSubmitted && (
              <>
                <Button
                  variant="outline primary"
                  size="base"
                  className="min-h-8 max-w-24 px-9 py-0.5"
                  onClick={handleformsubmit}
                >
                  Ajukan
                </Button>
              </>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
