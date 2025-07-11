"use client";
import React from "react";

import Button from "@/app/components/button/Button";

import AlertModal from "./variants/alertModal";
import ConfirmModal from "./variants/confirmModal";
import SuccessModal from "./variants/successModal";

export default function ModalPage() {
  return (
    <>
      <section>
        <div className="flex flex-wrap justify-center gap-4 bg-red-100 h-screen pt-24">
          {/* Modal template*/}
          <AlertModal>
            {({ openModal }) => (
              <Button variant="danger" onClick={openModal} className="h-10">
                Alert Modal
              </Button>
            )}
          </AlertModal>

          <ConfirmModal>
            {({ openModal }) => (
              <Button variant="warning" onClick={openModal} className="h-10">
                Confirm Modal
              </Button>
            )}
          </ConfirmModal>

          <SuccessModal>
            {({ openModal }) => (
              <Button variant="success" onClick={openModal} className="h-10">
                Success Modal
              </Button>
            )}
          </SuccessModal>
        </div>
      </section>
    </>
  );
}
