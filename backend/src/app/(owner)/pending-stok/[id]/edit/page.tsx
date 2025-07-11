"use client";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import Button from "@/app/components/button/Button";
import Dropdown2 from "@/app/components/Dropdown2";
import DatePicker from "@/app/components/Forms/Datepicker";
import Input from "@/app/components/Forms/Input";
import withAuth from "@/app/components/hoc/withAuth";
import {CancelModal} from "@/app/components/modal/variants/cancelModal";
import {SubmitModal} from "@/app/components/modal/variants/submitModal";
import api from "@/lib/api";
import {ApiError} from "@/types/api";
import {useMutation, useQuery} from "@tanstack/react-query";
import {AxiosError, AxiosResponse} from "axios";
import {format} from "date-fns";
import {usePathname} from "next/navigation";
import React, {useEffect, useMemo, useState} from "react";

import {FormProvider, useFieldArray, useForm} from "react-hook-form";
import toast from "react-hot-toast";
import {BiTrash} from "react-icons/bi";
import {LuPlus} from "react-icons/lu";

type FormData = {
    barcode_id: string;
    restok_id: string;
    produk_id: string;
    nama_produk: string;
    nama_supplier: string;
    supplier_id: number;
    merk_barang: string;
    merk_id: number;
    jenis_barang: string;
    jenis_id: number;
    nama_cv: string;
    cabang_id: number;
    tanggal_restok: string;
    harga_jual: number;
    details: {
        ukuran_produk: string;
        warna_produk: string;
        stok_produk: number;
    }[];
};

export type ProdukBaruRequest = {
    barcode_id: string;
    restok_id: string;
    produk_id: string;
    nama_produk: string;
    supplier_id: number;
    merk_id: number;
    jenis_id: number;
    cabang_id: number;
    tanggal_restok: string;
    details: {
        ukuran_produk: string;
        warna_produk: string;
        stok_produk: number;
    }[];
};

export default withAuth(EditPendingStok, "admin");

function EditPendingStok() {
    const methods = useForm<FormData>({
        mode: "onChange",
        defaultValues: {
            barcode_id: "",
            nama_produk: "",
            merk_barang: "",
            nama_supplier: "",
            jenis_barang: "",
            nama_cv: "",
            harga_jual: 0,
            tanggal_restok: "",
            details: [{ukuran_produk: "", warna_produk: "", stok_produk: 1}],
        },
    });

    const {handleSubmit, control, reset, register, setValue} = methods;

    const path = usePathname();
    const pathSegments = path.split("/");
    const pathId = pathSegments[pathSegments.length - 2];

    const breadCrumbs = [
        {href: "/pending-stok", Title: "Pending Stok"},
        {href: `/pending-stok/${pathId}`, Title: "Detail Pending Stok"},
        {href: `/pending-stok/${pathId}/edit`, Title: "Edit Pending Stok"},
    ];

    const {
        data: defaultData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["supplier"],
        queryFn: async () => {
            const response = await api.get(`/api/produk/pending/${pathId}`);
            return response.data;
        },
    });

    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [selectedMerk, setSelectedMerk] = useState<string | null>(null);

    const {fields, append, remove} = useFieldArray({
        control,
        name: "details",
    });

    const {data} = useQuery({
        queryKey: ["produk"],
        queryFn: async () => {
            const response = await api.get(`/api/produk/index`);
            return response;
        },
    });

    useEffect(() => {
        if (defaultData?.data && data?.data?.data?.data) {
            // Find supplier by merk
            const supplierData = data.data.data.data.find((item: any) =>
                item.supply?.some((s: any) => s.merk === defaultData.data.merk)
            );

            if (supplierData) {
                // Set supplier
                setSelectedSupplier(supplierData.supplier.id.toString());
                setValue("supplier_id", supplierData.supplier.id);

                // Find merk_id
                const merkData = supplierData.supply.find(
                    (s: any) => s.merk === defaultData.data.merk
                );
                if (merkData) {
                    setSelectedMerk(merkData.merk_id.toString());
                    setValue("merk_id", merkData.merk_id);

                    // Find jenis_id
                    const jenisData = merkData.jenis.find(
                        (j: any) => j.jenis === defaultData.data.jenis
                    );
                    if (jenisData) {
                        setValue("jenis_id", jenisData.jenis_id);
                    }
                }
            }

            // Set CV/cabang
            const cabangData = data.data.data.cabang.find(
                (c: any) => c.nama === defaultData.data.cv
            );
            if (cabangData) {
                setValue("cabang_id", cabangData.id);
            }

            // Set other form values
            methods.reset({
                barcode_id: defaultData.data.barcode,
                nama_produk: defaultData.data.nama_produk,
                nama_supplier: defaultData.data.supplier,
                merk_barang: defaultData.data.merk,
                jenis_barang: defaultData.data.jenis,
                nama_cv: defaultData.data.cv,
                harga_jual: defaultData.data.harga_jual,
                tanggal_restok: defaultData.data.stoks?.[0]?.tanggal_restok,
                details: defaultData.data.stoks?.map((stok: any) => ({
                    ukuran_produk: stok.ukuran,
                    warna_produk: stok.warna,
                    stok_produk: stok.stok,
                })) || [{ukuran_produk: "", warna_produk: "", stok_produk: 1}],
            });
        }
    }, [defaultData, data, setValue, methods]);

    const supplierOptions = useMemo(() => {
        if (!data?.data?.data?.data)
            return [{value: "", label: "No options found"}];
        const suppliers = Array.isArray(data.data.data.data)
            ? data.data.data.data
            : [];

        if (suppliers.length === 0)
            return [{value: "", label: "No options found"}];

        return suppliers.map((item: any) => ({
            value: item.supplier.id.toString(),
            label: item.supplier.name,
        }));
    }, [data]);

    const merkOptions = useMemo(() => {
        if (!data?.data?.data?.data || !selectedSupplier)
            return [{value: "", label: "No options found"}];

        const selectedSupplierData = data.data.data.data.find(
            (item: any) => item.supplier.id.toString() === selectedSupplier
        );

        if (
            !selectedSupplierData?.supply ||
            selectedSupplierData.supply.length === 0
        ) {
            return [{value: "", label: "No options found"}];
        }

        return selectedSupplierData.supply.map((item: any) => ({
            value: item.merk_id.toString(),
            label: item.merk,
        }));
    }, [data, selectedSupplier]);

    const jenisOptions = useMemo(() => {
        if (!data?.data?.data?.data || !selectedSupplier || !selectedMerk) {
            return [{value: "", label: "No options found"}];
        }

        const selectedSupplierData = data.data.data.data.find(
            (item: any) => item.supplier.id.toString() === selectedSupplier
        );

        if (!selectedSupplierData?.supply) {
            return [{value: "", label: "No options found"}];
        }

        const selectedMerkData = selectedSupplierData.supply.find(
            (item: any) => item.merk_id.toString() === selectedMerk
        );

        if (!selectedMerkData?.jenis || selectedMerkData.jenis.length === 0) {
            return [{value: "", label: "No options found"}];
        }

        return selectedMerkData.jenis.map((item: any) => ({
            value: item.jenis_id.toString(),
            label: item.jenis,
        }));
    }, [data, selectedSupplier, selectedMerk]);

    const cabangOptions = useMemo(() => {
        if (!data?.data?.data?.cabang)
            return [{value: "", label: "No options found"}];
        if (data.data.data.cabang.length === 0)
            return [{value: "", label: "No options found"}];

        return data.data.data.cabang.map((item: any) => ({
            value: item.id.toString(),
            label: item.nama,
        }));
    }, [data]);

    const handleSupplierChange = (value: string) => {
        const supplier = supplierOptions.find((opt: any) => opt.label === value);
        if (supplier) {
            setSelectedSupplier(supplier.value);
            setValue("supplier_id", parseInt(supplier.value));
            setValue("merk_id", -1);
            setValue("jenis_id", -1);
            setSelectedMerk("");
        }
    };

    const handleMerkChange = (value: string) => {
        const merk = merkOptions.find((opt: any) => opt.label === value);
        if (merk) {
            setSelectedMerk(merk.value);
            setValue("merk_id", parseInt(merk.value));
            setValue("jenis_id", -1);
        }
    };

    const handleJenisChange = (value: string) => {
        const jenis = jenisOptions.find((opt: any) => opt.label === value);
        if (jenis) {
            setValue("jenis_id", parseInt(jenis.value));
        }
    };

    const handleCabangChange = (value: string) => {
        const cabang = cabangOptions.find((opt: any) => opt.label === value);
        if (cabang) {
            setValue("cabang_id", parseInt(cabang.value));
        }
    };

    const [response, setResponse] = useState("not submitted");

    const {mutate: ProdukBaruMutation, isPending} = useMutation<
        AxiosResponse,
        AxiosError<ApiError>,
        ProdukBaruRequest
    >({
        mutationFn: async (data: ProdukBaruRequest) => {
            return await api.patch("/api/produk/pending", data);
        },
        onSuccess: () => {
            toast.success("Berhasil mengedit pending stok!");
            setResponse("submitted");
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const onSubmit = (data: FormData) => {
        const formattedDate = format(new Date(data.tanggal_restok), "yyyy-MM-dd");
        const hargaJual = parseFloat(String(data.harga_jual).replace(/\./g, ""));

        const {
            nama_cv,
            merk_barang,
            jenis_barang,
            nama_supplier,
            ...filteredData
        } = data;

        const payload = {
            ...filteredData,
            supplier_id: parseInt(String(filteredData.supplier_id)),
            merk_id: parseInt(String(filteredData.merk_id)),
            jenis_id: parseInt(String(filteredData.jenis_id)),
            cabang_id: parseInt(String(filteredData.cabang_id)),
            tanggal_restok: formattedDate,
            harga_jual: hargaJual,
            produk_id: defaultData?.data?.id_produk,
            restok_id: defaultData?.data?.restok_id,
        };

        ProdukBaruMutation(payload);

        return;
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-nav px-8 py-4 overflow-y-auto">
            <BreadCrumbs breadcrumbs={breadCrumbs}/>
            <h1 className="text-H1">Form Edit Pending Stok</h1>

            <div className="w-full mt-8">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
                        <div className="flex flex-row space-x-32 justify-between">
                            {/* Left column */}
                            <div className="w-[40%] flex flex-col space-y-[15px]">
                                <Input
                                    type="text"
                                    id="barcode_id"
                                    label={"Barcode Barang"}
                                    placeholder="ex. 1239894819"
                                    validation={{required: "Barcode Barang harus diisi"}}
                                    disabled
                                />

                                <Input
                                    type="text"
                                    id="nama_produk"
                                    label={"Nama Barang"}
                                    placeholder="ex. Kemeja Putih Executive"
                                    validation={{required: "Nama Barang harus diisi"}}
                                    disabled
                                />

                                <p className="text-S2">Pilih Supplier</p>
                                <Dropdown2
                                    id="nama_supplier"
                                    title="Pilih Supplier"
                                    contents={supplierOptions.map((opt: any) => opt.label)}
                                    defaultValue={defaultData?.data?.supplier}
                                    onChange={handleSupplierChange}
                                />

                                <p className="text-S2">Merk Barang</p>
                                <Dropdown2
                                    id="merk_barang"
                                    title="Pilih Merk"
                                    contents={merkOptions.map((opt: any) => opt.label)}
                                    onChange={handleMerkChange}
                                    defaultValue={defaultData?.data?.merk}
                                />

                                <p className="text-S2">Kategori Barang</p>
                                <Dropdown2
                                    id="jenis_barang"
                                    title="Pilih Kategori"
                                    contents={jenisOptions.map((opt: any) => opt.label)}
                                    onChange={handleJenisChange}
                                    defaultValue={defaultData?.data?.jenis}
                                />

                                <p className="text-S2">Pilih CV</p>
                                <Dropdown2
                                    id="nama_cv"
                                    title="Pilih CV"
                                    contents={cabangOptions.map((opt: any) => opt.label)}
                                    onChange={handleCabangChange}
                                    defaultValue={defaultData?.data?.cv}
                                />

                                <input type="hidden" {...register("supplier_id")} />
                                <input type="hidden" {...register("merk_id")} />
                                <input type="hidden" {...register("jenis_id")} />
                                <input type="hidden" {...register("cabang_id")} />

                                <DatePicker
                                    id="tanggal_restok"
                                    label="Tanggal Restok"
                                    placeholder="dd-mm-yyyy"
                                    format="dd-MM-yyyy"
                                    validation={{
                                        required: "Tanggal Restok Harus Diisi",
                                    }}
                                    containerClassName="w-full"
                                    defaultValue={defaultData?.data?.stoks?.[0]?.tanggal_restok}
                                />

                                <Input
                                    type="number"
                                    id="harga_jual"
                                    label={"Harga Barang"}
                                    placeholder="ex. 100000"
                                    leftIcon={"Rp. "}
                                    //   formatNumber
                                    validation={{
                                        required: "Harga Barang harus diisi",
                                    }}
                                />
                            </div>

                            {/* Right column - Dynamic fields for Stok */}
                            <div className="flex flex-col w-[60%] space-y-[15px]">
                                <div className="border-b-2 border-brand-600 py-2">
                                    <p className="text-S2 text-brand-600">Jumlah Stok</p>
                                </div>

                                <div className="flex justify-between text-start space-x-4 text-S2 pr-[3rem]">
                                    <p className="w-full">Ukuran</p>
                                    <p className="w-full">Warna</p>
                                    <p className="w-full">Jumlah</p>
                                </div>
                                {/* Dynamically generated fields */}
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="flex justify-between space-x-4"
                                    >
                                        {/* Ukuran Input */}
                                        <div className="w-full">
                                            <Input
                                                type="text"
                                                id={`details.[${index}].ukuran_produk`}
                                                label={null}
                                                placeholder="ex. L, XL, M"
                                                defaultValue={field.ukuran_produk}
                                                {...register(
                                                    `details.${index}.ukuran_produk` as const,
                                                    {
                                                        required: "Ukuran harus diisi",
                                                    }
                                                )}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <Input
                                                type="text"
                                                id={`details.[${index}].warna_produk`}
                                                label={null}
                                                placeholder="ex. Merah"
                                                defaultValue={field.warna_produk}

                                            />
                                        </div>
                                        <div className="w-full">
                                            <Input
                                                type="number"
                                                id={`details.${index}.stok_produk`}
                                                label={null}
                                                placeholder="ex. 10"
                                                defaultValue={field.stok_produk}
                                                {...register(`details.${index}.stok_produk` as const, {
                                                    required: "Jumlah harus diisi",
                                                    valueAsNumber: true,
                                                })}
                                            />
                                        </div>

                                        {/* Remove Button */}
                                        <Button
                                            size="icon"
                                            variant="danger"
                                            onClick={() => remove(index)}
                                            icon={BiTrash}
                                            className="min-w-10"
                                        ></Button>
                                    </div>
                                ))}
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                        append({
                                            ukuran_produk: "",
                                            stok_produk: 1,
                                            warna_produk: "",
                                        })
                                    }
                                    icon={LuPlus}
                                ></Button>
                                {/* Add Stok Button */}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 flex justify-end space-x-4">
                            <CancelModal path="/stok">
                                {({openModal}) => (
                                    <Button variant="outline primary" onClick={openModal}>
                                        Batal
                                    </Button>
                                )}
                            </CancelModal>
                            <SubmitModal
                                message="Data Pending Stok berhasil Disimpan!"
                                path="/pending-stok"
                                onSubmit={handleSubmit(onSubmit)}
                                onReset={reset}
                                response={response}
                            >
                                {({openModal}) => (
                                    <Button
                                        variant="primary"
                                        size="base"
                                        onClick={handleSubmit(() => {
                                            openModal();
                                        })}
                                        isLoading={isPending}
                                        type="submit"
                                    >
                                        Submit
                                    </Button>
                                )}
                            </SubmitModal>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
