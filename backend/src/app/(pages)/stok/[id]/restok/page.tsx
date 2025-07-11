"use client";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import Button from "@/app/components/button/Button";
import Dropdown2 from "@/app/components/Dropdown2";
import DatePicker from "@/app/components/Forms/Datepicker";
import Input from "@/app/components/Forms/Input";
import withAuth from "@/app/components/hoc/withAuth";
import { CancelModal } from "@/app/components/modal/variants/cancelModal";
import { SubmitModal } from "@/app/components/modal/variants/submitModal";
import api from "@/lib/api";
import { ApiError } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { format } from "date-fns";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { BiTrash } from "react-icons/bi";
import { LuPlus } from "react-icons/lu";

type FormData = {
  id: number;
  nama_supplier: string;
  supplier_id: number;
  merk_barang: string;
  merk_id: number;
  jenis_barang: string;
  jenis_id: number;
  nama_cv: string;
  cabang_id: number;
  harga_jual: number;
  tanggal_restok: string;
  details: {
    ukuran_produk: string;
    warna_produk: string;
    stok_produk: number;
  }[];
};

export type ProdukLamaRequest = {
  produk_id: number;
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

export default withAuth(TambahStokLama, "stok");
function TambahStokLama() {
  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      merk_id: -1,
      jenis_id: -1,
      cabang_id: -1,
      details: [{ ukuran_produk: "", stok_produk: 1 }],
    },
  });

  const { handleSubmit, control, reset, register, setValue } = methods;

  const path = usePathname();
  const pathParts = path.split("/");

  const pathId = pathParts.length > 2 ? pathParts[2] : null;

  const breadCrumbs = [
    { href: "/stok", Title: "Stok" },
    { href: `/stok/${pathId}`, Title: "Detail Stok" },
    { href: `/stok/${pathId}/restok`, Title: "Form Restok Barang Lama" },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["produk"],
    queryFn: async () => {
      const response = await api.get(`/api/produk/${pathId}`);
      return response.data.data;
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const [response, setResponse] = useState("not submitted");

  const { mutate: ProdukLamaMutation, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    ProdukLamaRequest
  >({
    mutationFn: async (data: ProdukLamaRequest) => {
      return await api.post("/api/produk/create-old", data);
    },
    onSuccess: () => {
      toast.success("Berhasil menambahkan stok lama!");
      setResponse("submitted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (formData: FormData) => {
    const formattedDate = format(
      new Date(formData.tanggal_restok),
      "yyyy-MM-dd"
    );

    const hargaJual = parseFloat(
      String(formData.harga_jual).replace(/\./g, "")
    );

    const {
      nama_cv,
      merk_barang,
      jenis_barang,
      nama_supplier,
      ...filteredData
    } = formData;

    const payload = {
      ...filteredData,
      tanggal_restok: formattedDate,
      produk_id: data?.id,
      merk_id: data?.merk_id,
      supplier_id: data?.supplier_id,
      cabang_id: data?.cv_id,
      jenis_id: data?.jenis_id,
      harga_jual: hargaJual,
    };

    ProdukLamaMutation(payload);
    return;
  };

  return (
    <div className="h-nav px-8 py-4 overflow-y-auto">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <h1 className="text-H1">Form Restok Barang Lama</h1>

      <div className="w-full mt-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
            <div className="flex flex-row space-x-32 justify-between">
              {/* Left column */}
              <div className="w-[40%] flex flex-col space-y-[15px]">
                <p className="text-S2">Produk</p>
                <Dropdown2
                  id="nama_supplier"
                  title={data?.nama_produk}
                  contents={"hello"}
                />

                <p className="text-S2">Merk Barang</p>
                <Dropdown2
                  id="merk_barang"
                  title={data?.merk}
                  contents={"hello"}
                />

                <p className="text-S2">Supplier</p>
                <Dropdown2
                  id="jenis_barang"
                  title={data?.supplier_id}
                  contents={"hello"}
                />

                <p className="text-S2">CV</p>
                <Dropdown2 id="nama_cv" title={data?.cv} contents={"hello"} />

                <DatePicker
                  id="tanggal_restok"
                  label="Tanggal Restok"
                  placeholder="dd-mm-yyyy"
                  format="dd-MM-yyyy"
                  validation={{
                    required: "Tanggal Restok Harus Diisi",
                  }}
                  containerClassName="w-full"
                />

                <Input
                  type="number"
                  id="harga_jual"
                  label={"Harga Barang"}
                  placeholder="ex. 100000"
                  leftIcon={"Rp."}
                  formatNumber
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
                {fields.map((item, index) => (
                  <div key={item.id} className="flex justify-between space-x-4">
                    {/* Ukuran Input */}
                    <div className="w-full">
                      <Input
                        type="text"
                        id={`details.[${index}].ukuran_produk`}
                        label={null}
                        placeholder="ex. L, XL, M"
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
                        {...register(`details.${index}.warna_produk` as const)}
                      />
                    </div>
                    <div className="w-full">
                      <Input
                        type="number"
                        id={`details.${index}.stok_produk`}
                        label={null}
                        min={1}
                        placeholder="ex. 10"
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
              <CancelModal path={`/stok/${pathId}`}>
                {({ openModal }) => (
                  <Button variant="outline primary" onClick={openModal}>
                    Batal
                  </Button>
                )}
              </CancelModal>
              <SubmitModal
                message="Produk Lama berhasil ditambah!"
                path="/pending-stok"
                onSubmit={handleSubmit(onSubmit)}
                onReset={reset}
                response={response}
              >
                {({ openModal }) => (
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
