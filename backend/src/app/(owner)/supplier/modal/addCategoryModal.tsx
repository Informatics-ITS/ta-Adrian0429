"use client";
import {useDisclosure} from "@nextui-org/modal";
import React from "react";
import Button from "@/app/components/button/Button";
import Modal from "@/app/components/modal/Modal";
import Input from "@/app/components/Forms/Input";
import {FormProvider, SubmitHandler, useForm} from "react-hook-form";
import {AxiosError, AxiosResponse} from "axios";
import {ApiError} from "@/types/api";
import toast from "react-hot-toast";
import api from "@/lib/api";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SupplierSubmitModal} from "./submitModal";

type ModalReturnType = {
    openModal: () => void;
};

type Category = {
    nama_jenis: string;
};

export function AddCategoryModal({
                                     children,
                                 }: {
    children: (props: ModalReturnType) => JSX.Element;
    onReset: () => void;
}) {
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();
    const modalReturn: ModalReturnType = {
        openModal: onOpen,
    };

    const queryClient = useQueryClient();

    const methods = useForm<Category>({
        mode: "onChange",
    });

    const {reset, handleSubmit, register} = methods;

    const {mutate: CategoryMutation, isPending} = useMutation<
        AxiosResponse,
        AxiosError<ApiError>,
        Category
    >({
        mutationFn: async (data: Category) => {
            return await api.post("/api/jenis", data);
        },
        onSuccess: () => {
            toast.success("Berhasil menambahkan kategori baru!");
            queryClient.invalidateQueries({queryKey: ["jenis"]});
            onClose();
            reset();
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const onSubmit: SubmitHandler<Category> = (data) => {
        CategoryMutation(data);
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
                className="w-[400px] flex mx-auto border-none"
            >
                <Modal.Header
                    className="flex justify-center mt-10"
                    onClose={onClose}
                    buttonCrossClassName="mt-[10px] mr-[10px]"
                >
                    Tambah Kategori
                </Modal.Header>

                <Modal.Body className="text-center px-10 mt-5">
                    <FormProvider {...methods}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-5 max-h-[calc(100vh-300px)] mb-2"
                        >
                            <Input
                                type="text"
                                id="nama_jenis"
                                label={"Nama Kategori"}
                                placeholder="Kategori"
                                {...register("nama_jenis", {
                                    required: "Nama Kategori harus diisi",
                                })}
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
                            onClick={() => {
                                onClose();
                                reset();
                            }}
                        >
                            Batal
                        </Button>
                        <SupplierSubmitModal
                            onSubmit={handleSubmit(onSubmit)}
                            onReset={reset}
                        >
                            {({openModal}) => (
                                <Button
                                    variant="outline primary"
                                    size="base"
                                    onClick={handleSubmit(() => {
                                        openModal();
                                    })}
                                    isLoading={isPending}
                                >
                                    Tambah
                                </Button>
                            )}
                        </SupplierSubmitModal>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}
