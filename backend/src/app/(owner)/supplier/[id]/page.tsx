"use client";
import Button from "@/app/components/button/Button";
import {FormProvider, useFieldArray, useForm} from "react-hook-form";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import {PencilLine} from "lucide-react";
import withAuth from "@/app/components/hoc/withAuth";
import {usePathname, useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import {SupplierDeleteModal} from "@/app/(owner)/supplier/modal/deleteModal";

export type Supplier = {
    id: number;
    name: string;
    no_hp: string;
    discount: number;
    merk: Merk[];
};

export type Merk = {
    nama_merk: string;
    jenis: Jenis[];
    discount_merk: number;
};

export type Jenis = {
    id: number;
    nama_jenis: string;
};

export default withAuth(DetailSupplier, "admin");

function DetailSupplier() {
    const methods = useForm<Supplier>({
        mode: "onChange",
        defaultValues: {
            merk: [],
        },
    });

    const router = useRouter();
    const path = usePathname();
    const pathId = path.split("/").pop();

    const breadCrumbs = [
        {href: "/supplier", Title: "Supplier"},
        {href: `/supplier/${pathId}`, Title: "Detail Supplier"},
    ];

    const {data} = useQuery({
        queryKey: ["supplier"],
        queryFn: async () => {
            const response = await api.get(`/api/supplier/${pathId}`);
            return response.data.data;
        },
    });

    const supplier = data || [];

    const {reset, handleSubmit, control, register} = methods;
    const {fields, append, remove} = useFieldArray({
        control,
        name: "merk",
    });

    // @ts-ignore
    const sortedMerks = supplier?.merk?.sort((a, b) =>
        a.jenis.length - b.jenis.length
    );

    const onSubmit = (data: Supplier) => {
        console.log(data);
    };

    return (
        <div className="h-nav px-8 py-4 overflow-y-auto">
            <BreadCrumbs breadcrumbs={breadCrumbs}/>
            <h1 className="text-H1">Detail Supplier</h1>

            <div className="flex flex-col w-full mt-8">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex gap-5 items-center">
                            <h1 className="text-D2">{supplier?.name}</h1>
                            <Button
                                variant="unstyled"
                                size="base"
                                onClick={() => {
                                    router.push(`/supplier/${pathId}/edit`);
                                }}
                                leftIcon={PencilLine}
                                className="shadow-none text-[#F0661B]"
                            >
                                <span className="text-H4">Edit Data</span>
                            </Button>
                        </div>

                        <table
                            className="text-B1 table-fixed mt-[50px] border-separate border-spacing-x-[30px] border-spacing-y-[10px] -ml-[30px]">
                            <tbody>
                            <tr>
                                <td className="text-S1">ID Supplier</td>
                                <td>:</td>
                                <td>{supplier?.id}</td>
                            </tr>
                            <tr>
                                <td className="text-S1">Nama</td>
                                <td>:</td>
                                <td>{supplier?.name}</td>
                            </tr>
                            <tr>
                                <td className="text-S1">Nomor Telepon</td>
                                <td>:</td>
                                <td>{supplier?.no_hp}</td>
                            </tr>
                            <tr>
                                <td className="text-S1">Diskon Supplier</td>
                                <td>:</td>
                                <td>{supplier?.discount}</td>
                            </tr>
                            <tr>
                                <td className="text-S1">Merek</td>
                                <td></td>
                                <td>
                                    <Button
                                        variant="unstyled"
                                        size="base"
                                        onClick={() => {
                                            router.push(`/supplier/${pathId}/edit/merk`);
                                        }}
                                        leftIcon={PencilLine}
                                        leftIconClassName="size-4"
                                        className="shadow-none text-[#F0661B] -ml-[130px]"
                                    >
                                        <span className="text-H6">Edit Merk</span>
                                    </Button>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <div className="flex flex-col gap-5 mt-[15px]">
                            <div>
                                <div className="mb-6">
                                    {sortedMerks?.map((merk: Merk, merkIndex: number) => (
                                        <div key={merkIndex} className="mt-4">
                                            <h1 className="text-S1">
                                                {merkIndex + 1}. {merk.nama_merk}
                                            </h1>
                                            <h3 className="text-S3 mt-[10px]">
                                                Diskon:{" "}
                                                <span className="text-B3">{merk.discount_merk}</span>%
                                            </h3>

                                            <h3 className="text-S3 mt-2">
                                                Kategori:{" "}
                                                <span className="text-B3">
                          {merk.jenis
                              .map((jenis: Jenis) => jenis.nama_jenis)
                              .join(", ")}
                        </span>
                                            </h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <SupplierDeleteModal id={supplier?.id}>
                            {({openModal}) => (
                                <Button
                                    variant="danger"
                                    size="base"
                                    onClick={openModal}
                                    className="my-[50px]"
                                >
                                    Hapus
                                </Button>
                            )}
                        </SupplierDeleteModal>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
