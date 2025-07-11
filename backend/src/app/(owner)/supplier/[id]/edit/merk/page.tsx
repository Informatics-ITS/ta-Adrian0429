"use client";
import Button from "@/app/components/button/Button";
import Input from "@/app/components/Forms/Input";
import {useEffect, useState} from "react";
import {FormProvider, SubmitHandler, useFieldArray, useForm,} from "react-hook-form";
import {BiTrash} from "react-icons/bi";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import {SupplierSubmitModal} from "@/app/(owner)/supplier/modal/submitModal";
import {useMutation, useQuery} from "@tanstack/react-query";
import {AxiosError, AxiosResponse} from "axios";
import {ApiError} from "@/types/api";
import api from "@/lib/api";
import toast from "react-hot-toast";
import withAuth from "@/app/components/hoc/withAuth";
import {AddCategoryModal} from "@/app/(owner)/supplier/modal/addCategoryModal";
import {Plus} from "lucide-react";
import {InputMerk} from "@/app/(owner)/supplier/tambah/components/InputMerkFields";
import {CancelModal} from "@/app/components/modal/variants/cancelModal";
import {usePathname} from "next/navigation";
import SelectInput from "@/app/components/Forms/MultiSelectInput";

export type EditSupplier = {
    merk_request: MerkRequest[];
};

export type MerkRequest = {
    nama_merk: string;
    discount_merk: number;
    jenis_request?: { nama_jenis: string }[];
    _selectedJenisIds?: string[]; // Temporary property for SelectInput
};
export default withAuth(EditMerkSupplier, "admin");

function EditMerkSupplier() {
    const path = usePathname();
    const pathId = path.split("/").slice(-3, -1)[0];

    const breadCrumbs = [
        {href: "/supplier", Title: "Supplier"},
        {href: `/supplier/${pathId}`, Title: "Detail Supplier"},
        {href: `/supplier/${pathId}/edit`, Title: "Form Edit Supplier"},
    ];

    // Fetch supplier data
    const {data: supplierData, isLoading: isSupplierLoading} = useQuery({
        queryKey: ["supplier"],
        queryFn: async () => {
            const response = await api.get(`/api/supplier/${pathId}`);
            return response.data.data;
        },
    });


    // Fetch categories (moved from KategoriMerkFields)
    const {data: jenisData, isLoading: isJenisLoading} = useQuery({
        queryKey: ["jenis"],
        queryFn: async () => {
            const response = await api.get("/api/jenis");
            return response.data.data;
        },
    });

    // Transform jenis data to options for SelectInput
    const jenisOptions = jenisData ? jenisData.map((jenis: any) => ({
        value: jenis.id.toString(),
        label: jenis.nama_jenis
    })) : [];


    const methods = useForm<EditSupplier>({
        mode: "onChange",
        defaultValues: {
            merk_request: [],
        },
    });

    const [isFormReady, setIsFormReady] = useState(false);

    useEffect(() => {
        if (supplierData && !isSupplierLoading) {
            const transformedMerk = [...supplierData.merk]
                .sort((a, b) => a.jenis.length - b.jenis.length)
                .map((merk: any) => ({
                    nama_merk: merk.nama_merk,
                    discount_merk: merk.discount_merk,
                    _selectedJenisIds: merk.jenis.map((j: any) => j.id.toString()),
                    jenis_request: merk.jenis.map((j: any) => ({
                        nama_jenis: j.nama_jenis
                    })),
                }));

            methods.reset({
                merk_request: transformedMerk,
            });

            setIsFormReady(true);
        }
    }, [supplierData, isSupplierLoading, methods]);

    const {reset, handleSubmit, control, register} = methods;
    const [response, setResponse] = useState("not submitted");

    const {mutate: SupplierMutation, isPending} = useMutation<
        AxiosResponse,
        AxiosError<ApiError>,
        { data: MerkRequest[] }
    >({
        mutationFn: async (data: { data: MerkRequest[] }) => {
            return await api.patch(`/api/supplier/supply/${pathId}`, data);
        },
        onSuccess: () => {
            reset;
            toast.success("Berhasil mengubah data merk Supplier!");
            setResponse("submitted");
        },
        onError: (err) => {
            toast.error(err.message);
            setResponse("not submitted");
        },
    });

    const [namaMerk, setNamaMerk] = useState("");
    const [isError, setIsError] = useState(false);

    const {fields, append, remove} = useFieldArray({
        control,
        name: "merk_request",
    });

    const handleAppend = () => {
        if (namaMerk.trim() === "") {
            toast.error("Nama Merk tidak boleh kosong.");
            return;
        }

        const isDuplicate = fields.some((field) => field.nama_merk === namaMerk);

        if (isDuplicate) {
            toast.error("Nama Merk sudah ada.");
            return;
        }

        append({
            nama_merk: namaMerk,
            discount_merk: 0,
            jenis_request: [],
        });

        setNamaMerk("");
    };

    const onSubmit: SubmitHandler<EditSupplier> = (data) => {
        const sortedMerkRequest = [...data.merk_request].sort((a, b) => {
            // For form data, we need to use _selectedJenisIds length or jenis_request length
            const aLength = Array.isArray(a._selectedJenisIds) ? a._selectedJenisIds.length : 0;
            const bLength = Array.isArray(b._selectedJenisIds) ? b._selectedJenisIds.length : 0;
            return aLength - bLength;
        });

        const transformedData = {
            data: sortedMerkRequest.map((merk: any) => ({
                nama_merk: merk.nama_merk,
                discount_merk: merk.discount_merk,
                // Create jenis_request array from selected IDs
                jenis_request: Array.isArray(merk._selectedJenisIds)
                    ? merk._selectedJenisIds.map((id: string) => ({
                        nama_jenis: jenisData.find((j: any) => j.id.toString() === id)?.nama_jenis || ""
                    }))
                    : []
            })),
        };

        SupplierMutation(transformedData);
    };

    if (isSupplierLoading || isJenisLoading || !isFormReady) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-nav px-8 py-4">
            <BreadCrumbs breadcrumbs={breadCrumbs}/>
            <div className="flex justify-between">
                <h1 className="text-H1">Form Edit Merk Supplier</h1>
                <AddCategoryModal onReset={reset}>
                    {({openModal}) => (
                        <Button
                            variant="unstyled"
                            size="base"
                            onClick={openModal}
                            leftIcon={Plus}
                            className="shadow-none text-[#F0661B] hover:bg-[#F0661B] hover:text-white duration-200"
                        >
                            <span className="text-H4">Tambah Kategori</span>
                        </Button>
                    )}
                </AddCategoryModal>
            </div>

            <div className="flex flex-col w-full mt-8">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="w-full space-y-3">
                            <p className="text-S2">Input Merk</p>
                            <div className="flex space-x-4 w-full">
                                <InputMerk
                                    merkIndex={namaMerk}
                                    control={control}
                                    register={register}
                                    value={namaMerk}
                                    onChange={setNamaMerk}
                                    isError={isError}
                                />

                                <Button
                                    variant="primary"
                                    onClick={handleAppend}
                                    className="h-[2.25rem] md:h-[2.5rem]"
                                >
                                    Tambah
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {!isSupplierLoading && !isJenisLoading && fields.map((item, index) => (
                                <div key={item.id} className="space-y-4">
                                    <div className="flex w-full space-x-4">
                                        <Input
                                            id={`merk_request.${index}.nama_merk`}
                                            type="text"
                                            label={null}
                                            containerClassName="w-[20%]"
                                            placeholder="ex. Merk ABC"
                                            {...register(`merk_request.${index}.nama_merk`, {
                                                required: true,
                                            })}
                                        />

                                        <div className="flex w-[10%] items-center justify-center space-x-2">
                                            <Input
                                                id={`merk_request.${index}.discount_merk`}
                                                type="number"
                                                containerClassName="w-full"
                                                label={null}
                                                placeholder="Diskon"
                                                {...register(`merk_request.${index}.discount_merk`, {
                                                    required: true,
                                                    valueAsNumber: true,
                                                    min: {
                                                        value: 0,
                                                        message: "Diskon tidak boleh minus",
                                                    },
                                                })}
                                            />
                                            <p>%</p>
                                        </div>

                                        <div className="w-[60%]">
                                            <SelectInput
                                                id={`merk_request.${index}._selectedJenisIds`} // Use our temporary property
                                                label={null}
                                                placeholder="Pilih Kategori"
                                                options={jenisOptions}
                                                isMulti
                                                defaultValue={methods.getValues(`merk_request.${index}._selectedJenisIds`) || []}
                                            />
                                        </div>

                                        <Button
                                            size="base"
                                            className="w-[4%]"
                                            variant="danger"
                                            onClick={() => remove(index)}
                                            icon={BiTrash}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit button should be inside the form */}
                        <div className="flex justify-end gap-[10px]">
                            <CancelModal path="/supplier">
                                {({openModal}) => (
                                    <Button
                                        variant="outline primary"
                                        size="large"
                                        onClick={openModal}
                                        className="mt-5"
                                    >
                                        Batal
                                    </Button>
                                )}
                            </CancelModal>

                            <SupplierSubmitModal
                                onSubmit={handleSubmit(onSubmit)}
                                onReset={reset}
                                push
                            >
                                {({openModal}) => (
                                    <Button
                                        variant="primary"
                                        size="large"
                                        isLoading={isPending}
                                        onClick={handleSubmit((data) => {
                                            if (data.merk_request.length === 0) {
                                                setIsError(true);
                                                return;
                                            }
                                            setIsError(false);
                                            openModal();
                                        })}
                                        className="mt-5"
                                    >
                                        Submit
                                    </Button>
                                )}
                            </SupplierSubmitModal>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
