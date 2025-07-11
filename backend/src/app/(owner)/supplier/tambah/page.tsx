"use client";
import Button from "@/app/components/button/Button";
import Input from "@/app/components/Forms/Input";
import {useState} from "react";
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
import {InputMerk} from "./components/InputMerkFields";
import {CancelModal} from "@/app/components/modal/variants/cancelModal";
import SelectInput from "@/app/components/Forms/MultiSelectInput";
import Loading from "@/app/components/Loading";

const breadCrumbs = [
    {href: "/supplier", Title: "Supplier"},
    {href: "/supplier/tambah", Title: "Form Tambah Supplier"},
];

type Supplier = {
    name: string;
    no_hp: string;
    discount: number;
    merk_request: MerkRequest[];
};

type MerkRequest = {
    nama_merk: string;
    discount_merk: number;
    jenis_request: { id: number; nama_jenis: string }[] | string[];
};

export default withAuth(AddSupplier, "admin");

function AddSupplier() {
    const methods = useForm<Supplier>({
        mode: "onChange",
        defaultValues: {
            merk_request: [],
        },
    });

    const {data: jenisData, isLoading: jenisLoading} = useQuery({
        queryKey: ["jenis"],
        queryFn: async () => {
            const response = await api.get("/api/jenis");
            return response;
        },
    });

    // Transform the data for SelectInput format
    // @ts-ignore
    const jenisOptions = jenisData?.data.data.map(jenis => ({
        value: jenis.id.toString(),
        label: jenis.nama_jenis
    })) || [];

    const {reset, handleSubmit, control, register} = methods;
    const [response, setResponse] = useState("not submitted");

    const {mutate: SupplierMutation, isPending} = useMutation<
        AxiosResponse,
        AxiosError<ApiError>,
        Supplier
    >({
        mutationFn: async (data: Supplier) => {
            const transformedData = {
                ...data,
                merk_request: data.merk_request.map(merk => ({
                    ...merk,
                    // Convert string[] to object[] format if needed
                    jenis_request: Array.isArray(merk.jenis_request)
                        ? merk.jenis_request.map(jenis => {
                            if (typeof jenis === 'string') {
                                // Find the corresponding jenis object from options
                                // @ts-ignore
                                const jenisObj = jenisData?.data.data.find(j => j.id.toString() === jenis);
                                return {
                                    id: parseInt(jenis),
                                    nama_jenis: jenisObj?.nama_jenis || ''
                                };
                            }
                            return jenis;
                        })
                        : []
                }))
            };

            return await api.post("/api/supplier", transformedData);
        },
        onSuccess: () => {
            reset;
            toast.success("Berhasil menambahkan Supplier baru!");
            setResponse("submitted");
        },
        onError: (err) => {
            toast.error(err.message);
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
            jenis_request: []
        });

        setNamaMerk("");
    };

    const onSubmit: SubmitHandler<Supplier> = (data) => {
        console.log(data);
        SupplierMutation(data);
        return;
    };

    if (jenisLoading) {
        return (<Loading/>)
    }

    return (
        <div className="h-nav px-8 py-4">
            <BreadCrumbs breadcrumbs={breadCrumbs}/>
            <div className="flex justify-between">
                <h1 className="text-H1">Form Tambah Supplier</h1>
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
                        <Input
                            type="text"
                            id="name"
                            label={"Nama Supplier"}
                            placeholder="Toko ABC"
                            validation={{required: "Nama Supplier harus diisi"}}
                        />

                        <Input
                            type="text"
                            id="no_hp"
                            label={"Nomor Telepon Supplier"}
                            placeholder="08xxxxxxxx"
                            validation={{required: "Nomor telepon harus diisi"}}
                        />

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
                            {fields.map((item, index) => (
                                <div key={item.id} className="space-y-4">
                                    <div className="flex w-full space-x-4 items-center">
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

                                        {/* Add dynamic fields for multiple kategoriMerk */}
                                        <div className="w-[60%]">
                                            <SelectInput
                                                id={`merk_request.${index}.jenis_request`}
                                                label={null}
                                                placeholder="Search Kategori"
                                                options={jenisOptions}
                                                isMulti={true}
                                                isSearchable={true}
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

                        <Input
                            type="number"
                            id="discount"
                            label={"Diskon Supplier"}
                            placeholder="0%"
                            {...register("discount", {
                                required: "Diskon harus diisi",
                                valueAsNumber: true,
                                min: {
                                    value: 0,
                                    message: "Diskon tidak boleh minus",
                                },
                            })}
                        />

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
                                            console.log(data.merk_request.length);
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
