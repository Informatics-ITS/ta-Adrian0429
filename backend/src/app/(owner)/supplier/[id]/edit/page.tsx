"use client";
import Button from "@/app/components/button/Button";
import Input from "@/app/components/Forms/Input";
import { KategoriMerkFields } from "@/app/components/KategoriMerkFields";
import { useEffect, useState } from "react";
import {
  FormProvider,
  useForm,
  useFieldArray,
  SubmitHandler,
} from "react-hook-form";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import { SupplierSubmitModal } from "@/app/(owner)/supplier/modal/submitModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { ApiError } from "@/types/api";
import api from "@/lib/api";
import toast from "react-hot-toast";
import withAuth from "@/app/components/hoc/withAuth";
import { AddCategoryModal } from "@/app/(owner)/supplier/modal/addCategoryModal";
import { Plus } from "lucide-react";
import { CancelModal } from "@/app/components/modal/variants/cancelModal";
import { usePathname } from "next/navigation";

export type EditSupplier = {
  name: string;
  no_hp: string;
  discount: number;
  merk_request: MerkRequest[];
};

export type MerkRequest = {
  nama_merk: string;
  discount_merk: number;
  jenis?: { id: number; nama_jenis: string }[];
};

export default withAuth(AddSupplier, "admin");
function AddSupplier() {
  const path = usePathname();
  const pathId = path.split("/").slice(-2, -1)[0];

  const breadCrumbs = [
    { href: "/supplier", Title: "Supplier" },
    { href: `/supplier/${pathId}`, Title: "Detail Supplier" },
    { href: `/supplier/${pathId}/edit`, Title: "Form Edit Supplier" },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["supplier"],
    queryFn: async () => {
      const response = await api.get(`/api/supplier/${pathId}`);
      return response.data.data;
    },
  });

  const methods = useForm<EditSupplier>({
    mode: "onChange",
    defaultValues: {
      name: "",
      no_hp: "",
      discount: 0,
      merk_request: [],
    },
  });

  useEffect(() => {
    if (data?.merk && !isLoading) {
      methods.reset({
        name: data.name,
        no_hp: data.no_hp,
        discount: data.discount,
        merk_request: data.merk,
      });
    }
  }, [data, isLoading, methods]);

  const { reset, handleSubmit, control, register } = methods;
  const [response, setResponse] = useState("not submitted");

  const { mutate: SupplierMutation, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    EditSupplier
  >({
    mutationFn: async (data: EditSupplier) => {
      return await api.patch(`/api/supplier/${pathId}`, data);
    },
    onSuccess: () => {
      reset;
      toast.success("Berhasil mengubah data Supplier!");
      setResponse("submitted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [namaMerk, setNamaMerk] = useState("");
  const [isError, setIsError] = useState(false);

  const { fields, append, remove } = useFieldArray({
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
    });

    setNamaMerk("");
  };

  const onSubmit: SubmitHandler<EditSupplier> = (data) => {
    SupplierMutation(data);
    return;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-nav px-8 py-4">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <div className="flex justify-between">
        <h1 className="text-H1">Form Edit Supplier</h1>
        <AddCategoryModal onReset={reset}>
          {({ openModal }) => (
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
              validation={{ required: "Nama Supplier harus diisi" }}
            />

            <Input
              type="text"
              id="no_hp"
              label={"Nomor Telepon Supplier"}
              placeholder="08xxxxxxxx"
              validation={{ required: "Nomor telepon harus diisi" }}
            />

            {/* <div className="w-full space-y-3">
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
            </div> */}

            {/* <div className="space-y-4">
              {fields.map((item, index) => (
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
                    </div> */}

            {/* Add dynamic fields for multiple kategoriMerk */}
            {/* <div className="w-[60%]">
                      <KategoriMerkFields
                        merkIndex={index}
                        control={control}
                        register={register}
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
            </div> */}

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
                {({ openModal }) => (
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
                {({ openModal }) => (
                  <Button
                    variant="primary"
                    size="large"
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
