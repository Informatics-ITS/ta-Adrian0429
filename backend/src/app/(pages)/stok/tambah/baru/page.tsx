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
import React, { useMemo, useState } from "react";

import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { BiTrash } from "react-icons/bi";
import { LuPlus } from "react-icons/lu";

const breadCrumbs = [
  { href: "/stok", Title: "Stok Barang" },
  { href: "/stok/tambah/baru", Title: "Form Ajuan Barang Baru" },
];

type FormData = {
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
  detail: {
    ukuran_produk: string;
    warna_produk: string;
    stok_produk: number;
  }[];
};

export type ProdukBaruRequest = {
  nama_produk: string;
  supplier_id: number;
  merk_id: number;
  jenis_id: number;
  cabang_id: number;
  tanggal_restok: string;
  detail: {
    ukuran_produk: string;
    warna_produk: string;
    stok_produk: number;
  }[];
};

export default withAuth(TambahStokBaru, "stok");
function TambahStokBaru() {
  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      nama_produk: "",
      merk_id: -1,
      jenis_id: -1,
      cabang_id: -1,
      detail: [{ ukuran_produk: "", stok_produk: 1 }], // Initialize with one entry for stok
    },
  });

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedMerk, setSelectedMerk] = useState("");

  const { handleSubmit, control, reset, register, setValue } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detail",
  });

  const { data } = useQuery({
    queryKey: ["produk"],
    queryFn: async () => {
      const response = await api.get(`/api/produk/index`);
      return response;
    },
  });

  const supplierOptions = useMemo(() => {
    if (!data?.data?.data?.data)
      return [{ value: "", label: "No options found" }];
    const suppliers = Array.isArray(data.data.data.data)
      ? data.data.data.data
      : [];

    if (suppliers.length === 0)
      return [{ value: "", label: "No options found" }];

    return suppliers.map((item: any) => ({
      value: item.supplier.id.toString(),
      label: item.supplier.name,
    }));
  }, [data]);

  const merkOptions = useMemo(() => {
    if (!data?.data?.data?.data || !selectedSupplier)
      return [{ value: "", label: "No options found" }];

    const selectedSupplierData = data.data.data.data.find(
      (item: any) => item.supplier.id.toString() === selectedSupplier
    );

    if (
      !selectedSupplierData?.supply ||
      selectedSupplierData.supply.length === 0
    ) {
      return [{ value: "", label: "No options found" }];
    }

    return selectedSupplierData.supply.map((item: any) => ({
      value: item.merk_id.toString(),
      label: item.merk,
    }));
  }, [data, selectedSupplier]);

  const jenisOptions = useMemo(() => {
    if (!data?.data?.data?.data || !selectedSupplier || !selectedMerk) {
      return [{ value: "", label: "No options found" }];
    }

    const selectedSupplierData = data.data.data.data.find(
      (item: any) => item.supplier.id.toString() === selectedSupplier
    );

    if (!selectedSupplierData?.supply) {
      return [{ value: "", label: "No options found" }];
    }

    const selectedMerkData = selectedSupplierData.supply.find(
      (item: any) => item.merk_id.toString() === selectedMerk
    );

    if (!selectedMerkData?.jenis || selectedMerkData.jenis.length === 0) {
      return [{ value: "", label: "No options found" }];
    }

    return selectedMerkData.jenis.map((item: any) => ({
      value: item.jenis_id.toString(),
      label: item.jenis,
    }));
  }, [data, selectedSupplier, selectedMerk]);

  const cabangOptions = useMemo(() => {
    if (!data?.data?.data?.cabang)
      return [{ value: "", label: "No options found" }];
    if (data.data.data.cabang.length === 0)
      return [{ value: "", label: "No options found" }];

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

  const { mutate: ProdukBaruMutation, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    ProdukBaruRequest
  >({
    mutationFn: async (data: ProdukBaruRequest) => {
      return await api.post("/api/produk/create", data);
    },
    onSuccess: () => {
      toast.success("Berhasil menambahkan stok baru!");
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
      tanggal_restok: formattedDate,
      harga_jual: hargaJual,
    };

    ProdukBaruMutation(payload);
    return;
  };

  return (
    <div className="h-nav px-8 py-4 overflow-y-auto">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <h1 className="text-H1">Form Ajuan Barang Baru</h1>

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
                  validation={{ required: "Barcode Barang harus diisi" }}
                />

                <Input
                  type="text"
                  id="nama_produk"
                  label={"Nama Barang"}
                  placeholder="ex. Kemeja Putih Executive"
                  validation={{ required: "Nama Barang harus diisi" }}
                />

                <p className="text-S2">Pilih Supplier</p>
                <Dropdown2
                  id="nama_supplier"
                  title="Pilih Supplier"
                  contents={supplierOptions.map((opt: any) => opt.label)}
                  onChange={handleSupplierChange}
                />

                <p className="text-S2">Merk Barang</p>
                <Dropdown2
                  id="merk_barang"
                  title="Pilih Merk"
                  contents={merkOptions.map((opt: any) => opt.label)}
                  onChange={handleMerkChange}
                  disabled={!selectedSupplier}
                />

                <p className="text-S2">Kategori Barang</p>
                <Dropdown2
                  id="jenis_barang"
                  title="Pilih Kategori"
                  contents={jenisOptions.map((opt: any) => opt.label)}
                  onChange={handleJenisChange}
                  disabled={!selectedMerk}
                />

                <p className="text-S2">Pilih CV</p>
                <Dropdown2
                  id="nama_cv"
                  title="Pilih CV"
                  contents={cabangOptions.map((opt: any) => opt.label)}
                  onChange={handleCabangChange}
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
                />

                <Input
                  type="number"
                  id="harga_jual"
                  label={"Harga Barang"}
                  placeholder="ex. 100000"
                  leftIcon={"Rp. "}
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
                        id={`detail.[${index}].ukuran_produk`}
                        label={null}
                        placeholder="ex. L, XL, M"
                        {...register(`detail.${index}.ukuran_produk` as const, {
                          required: "Ukuran harus diisi",
                        })}
                      />
                    </div>
                    <div className="w-full">
                      <Input
                        type="text"
                        id={`detail.[${index}].warna_produk`}
                        label={null}
                        placeholder="ex. Merah"
                        {...register(`detail.${index}.warna_produk` as const)}
                      />
                    </div>
                    <div className="w-full">
                      <Input
                        type="number"
                        id={`detail.${index}.stok_produk`}
                        min={1}
                        label={null}
                        placeholder="ex. 10"
                        {...register(`detail.${index}.stok_produk` as const, {
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
                {({ openModal }) => (
                  <Button variant="outline primary" onClick={openModal}>
                    Batal
                  </Button>
                )}
              </CancelModal>
              <SubmitModal
                message="Data Produk Baru berhasil Disimpan!"
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
