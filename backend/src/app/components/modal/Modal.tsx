/* 
  This component uses nextui as its base material.
  Check for the documentation in https://nextui.org/docs/components/modal#modal
*/

import {
  Modal as NextModal,
  ModalBody,
  ModalBodyProps,
  ModalContent,
  ModalFooter,
  ModalFooterProps,
  ModalHeader,
  ModalHeaderProps,
  ModalProps,
  UseDisclosureProps,
} from "@nextui-org/modal";
import React from "react";

import clsxm from "@/app/lib/clsxm";
import { FiX } from "react-icons/fi";

type ContentProps = {
  className?: string;
  children?: React.ReactNode;
};
type TitleProps = {
  onClose: () => void; // Function to call on close button click
  buttonCrossClassName?: string; // Custom class name for the close button
  crossClassName?: string; // Custom class name for the cross icon within the close button
};
type ModalRootProps = {
  modelContainerClassName?: string; // Custom class name for the modal container
  backdropClassName?: string; // Custom class name for the modal backdrop
};

export function ModalRoot({
  className, // Class name for additional styling
  modelContainerClassName, // Custom class name for the modal content container
  children, // Children components to render inside the modal
  isOpen, // Boolean to control the open state of the modal
  onOpenChange, // Function to handle changes in the open state
  scrollBehavior = "outside", // Scroll behavior of the modal
  backdrop = "opaque", // Backdrop appearance
  backdropClassName, // Custom class for the backdrop
  ...rest // Rest of the props
}: ModalRootProps & ContentProps & UseDisclosureProps & ModalProps) {
  return (
    <NextModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton={true} // Hiding the default close button
      scrollBehavior={scrollBehavior}
      backdrop={backdrop}
      classNames={{
        body: "p-0 border-none outline-none",
        wrapper: clsxm("flex-wrap items-center sm:items-center", className),
        backdrop: backdropClassName,
      }}
      {...rest}
    >
      <ModalContent
        className={clsxm(
          "rounded-xl bg-white p-0 shadow-none",
          modelContainerClassName
        )}
      >
        {children}
      </ModalContent>
    </NextModal>
  );
}

function Header({
  className,
  children,
  onClose, // Function to call when the close button is clicked
  buttonCrossClassName, // Custom class name for the close button
  crossClassName, // Custom class name for the cross icon
  ...rest
}: ContentProps & TitleProps & ModalHeaderProps) {
  return (
    <ModalHeader
      className={clsxm(
        "flex items-center justify-between",
        "rounded-t-xl p-0",
        "bg-white text-lg font-semibold text-typo-main md:text-xl",
        className
      )}
      {...rest}
    >
      {children}
      <button
        type="button"
        className={clsxm(
          "absolute right-0 top-0 float-right p-2",
          "text-gray-700 hover:text-gray-900",
          buttonCrossClassName
        )}
        onClick={onClose} // Handling close button click
      >
        <FiX className={clsxm("h-4 w-4", crossClassName)} />
        {/* Close icon with custom class */}
      </button>
    </ModalHeader>
  );
}

function Body({ className, children, ...rest }: ContentProps & ModalBodyProps) {
  return (
    <ModalBody
      className={clsxm(
        "flex flex-col p-0",
        "bg-white text-typo-main",
        className
      )}
      {...rest}
    >
      {children}
    </ModalBody>
  );
}

function Footer({
  className,
  children,
  ...rest
}: ContentProps & ModalFooterProps) {
  // Rendering the modal footer with custom classes for styling
  return (
    <ModalFooter
      className={clsxm(
        "flex flex-col p-0",
        "rounded-b-xl",
        "bg-white text-typo-main",
        className
      )}
      {...rest}
    >
      {children}
    </ModalFooter>
  );
}

// Combining ModalRoot with Header, Body, and Footer to create a complete Modal component
const Modal = Object.assign(ModalRoot, { Header, Body, Footer });
export default Modal; // Exporting the combined modal component for use
