"use client";
import { useDisclosure } from "@nextui-org/modal";
import React from "react";
import Button from "@/app/components/button/Button";
import Modal from "@/app/components/modal/Modal";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { PengeluaranData } from "@/app/(owner)/pengeluaran/PengeluaranTabs";
import { DeletePengeluaranModal } from "./deletePengeluaranModal";
import { EditPengeluaranModal } from "./editPengeluaranModal";

type ModalReturnType = {
  openModal: () => void;
};

const formatTimeToGMTPlus7 = (date: string) => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  return d.toLocaleString("en-US", options);
};

export function DetailPengeluaranModal({
  children,
  data,
}: {
  children: (props: ModalReturnType) => JSX.Element;
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
          className="flex mt-10 px-[30px]"
          onClose={onClose}
          buttonCrossClassName="mt-[10px] mr-[10px]"
        >
          {data.nama_pengeluaran}
        </Modal.Header>

        <Modal.Body className="text-left px-[30px] mt-5">
          <table className="border-separate border-spacing-y-[10px]">
            <tr>
              <td className="w-[40%] text-B2 text-neutral-700">Kategori</td>
              <td className="w-[60%] text-B2">{data.kategori_pengeluaran}</td>
            </tr>
            <tr>
              <td className="w-[40%] text-B2 text-neutral-700">Tanggal</td>
              <td className="w-[60%] text-B2">
                {formatTimeToGMTPlus7(data.tanggal_pengeluaran)}
              </td>
            </tr>
            <tr>
              <td className="w-[40%] text-B2 text-neutral-700">Jumlah</td>
              <td className="w-[60%] text-B2">
                Rp {data.jumlah.toLocaleString("id-ID")}
              </td>
            </tr>
            <tr>
              <td className="w-[40%] text-B2 text-neutral-700">
                Metode Pembayaran
              </td>
              <td className="w-[60%] text-B2">{data.tipe_pembayaran}</td>
            </tr>
            <tr>
              <td className="w-[40%] text-B2 text-neutral-700">Tujuan</td>
              <td className="w-[60%] text-B2">{data.tujuan}</td>
            </tr>
            <tr>
              <td className="w-[40%] text-B2 text-neutral-700">Deskripsi</td>
              <td className="w-[60%] text-B2">{data.description}</td>
            </tr>
          </table>
        </Modal.Body>

        <Modal.Footer className="mt-5 mb-8 px-[30px]">
          <div className="flex justify-end gap-[10px]">
            <DeletePengeluaranModal
              id={data.id.toString()}
              closeModal={onClose}
            >
              {({ openModal }) => (
                <Button
                  variant="outline primary"
                  size="base"
                  className="min-h-8 max-w-24 px-9 py-0.5"
                  onClick={openModal}
                >
                  Hapus
                </Button>
              )}
            </DeletePengeluaranModal>

            <EditPengeluaranModal data={data} closeModal={onClose}>
              {({ openModal }) => (
                <Button
                  variant="primary"
                  size="base"
                  type="submit"
                  onClick={openModal}
                  className="min-h-8 max-w-24 px-9 py-0.5"
                >
                  Edit
                </Button>
              )}
            </EditPengeluaranModal>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
