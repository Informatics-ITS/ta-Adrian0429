"use client";
import Button from "@/app/components/button/Button";
import { FormProvider, useForm } from "react-hook-form";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import { usePathname } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/Accordion";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { SubmitModal } from "@/app/components/modal/variants/submitModal";
import { useState } from "react";
import toast from "react-hot-toast";
import { ApiError } from "@/types/api";
import { AxiosResponse, AxiosError } from "axios";
import { DeletePendingStokModal } from "../modal/deletePendingStok";
import ButtonLink from "@/app/components/button/ButtonLink";
import Loading from "@/app/components/Loading";
import withAuth from "@/app/components/hoc/withAuth";

type DetailPendingStok = {
  id: number;
  barcode: string;
  nama_produk: string;
  merk: string;
  jenis: string;
  cv: string;
  stoks: DetailStok[];
};

type DetailStok = {
  tanggal_restok: string;
  ukuran: string;
  warna: string;
  stok: number;
};

const formatDate = (utcDateStr: string): string => {
  const utcDate = new Date(utcDateStr);
  return format(utcDate, "d MMMM yyyy", { locale: id });
};
export default withAuth(DetailPendingStok, "admin");
function DetailPendingStok() {
  const methods = useForm<DetailPendingStok>({
    mode: "onChange",
  });

  const router = useRouter();
  const path = usePathname();
  const pathId = path.split("/").pop();

  const breadCrumbs = [
    { href: "/pending-stok", Title: "Pending Stok" },
    { href: `/pending-stok/${pathId}`, Title: "Detail Pending Stok" },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["supplier"],
    queryFn: async () => {
      const response = await api.get(`/api/produk/pending/${pathId}`);
      return response.data.data;
    },
  });

  const restokId = data?.restok_id;

  const { reset, handleSubmit } = methods;

  const [response, setResponse] = useState("not submitted");

  const { mutate: AcceptStok, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>
  >({
    mutationFn: async () => {
      return await api.post(`/api/produk/pending/insert/${restokId}`);
    },
    onSuccess: () => {
      toast.success("Berhasil menyetujui penambahan stok!");
      setResponse("submitted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = () => {
    AcceptStok();
  };

  if (isLoading || !data?.stoks) {
    return <Loading />;
  }

  if (isError) {
    return <div className="px-8">Error fetching data.</div>;
  }

  return (
    <div className="h-nav px-8 py-4 overflow-y-auto">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <h1 className="text-H1">Detail Ajuan Pending Stok</h1>

      <div className="flex flex-col w-full mt-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-D2">{data?.nama_produk}</h1>
            <div className="flex gap-[100px] items-start mt-[50px]">
              <div className="w-full">
                <table className="text-B1 table-fixed border-separate border-spacing-x-[30px] border-spacing-y-[10px] -ml-[30px]">
                  <tbody>
                    <tr>
                      <td className="text-S1">Barcode</td>
                      <td>:</td>
                      <td>{data?.barcode}</td>
                    </tr>
                    <tr>
                      <td className="text-S1">Nama Produk</td>
                      <td>:</td>
                      <td>{data?.nama_produk}</td>
                    </tr>
                    <tr>
                      <td className="text-S1">Merk Barang</td>
                      <td>:</td>
                      <td>{data?.merk}</td>
                    </tr>
                    <tr>
                      <td className="text-S1">Kategori Barang</td>
                      <td>:</td>
                      <td>{data?.jenis}</td>
                    </tr>
                    <tr>
                      <td className="text-S1">CV</td>
                      <td>:</td>
                      <td>{data?.cv}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="w-full h-full bg-white">
                <Accordion
                  type="multiple"
                  className="w-full"
                  defaultValue={data.stoks.map(
                    (_item: DetailStok, index: number) => index.toString()
                  )}
                >
                  {data.stoks.map((item: DetailStok, index: number) => (
                    <AccordionItem
                      key={item.tanggal_restok + index}
                      value={index.toString()}
                      className="w-full text-S2 text-brand-600 py-2"
                    >
                      <AccordionTrigger className="px-5 py-2">
                        Tanggal Restok: {formatDate(item.tanggal_restok)}
                      </AccordionTrigger>
                      <AccordionContent className="mt-5 text-black">
                        <table className="text-B1 table-fixed border-separate border-spacing-x-[30px] border-spacing-y-[10px] -ml-[30px]">
                          <tbody>
                            <tr>
                              <td className="text-S1">Ukuran</td>
                              <td>:</td>
                              <td>{item.ukuran}</td>
                            </tr>
                            <tr>
                              <td className="text-S1">Warna</td>
                              <td>:</td>
                              <td>{item.warna}</td>
                            </tr>
                            <tr>
                              <td className="text-S1">Jumlah</td>
                              <td>:</td>
                              <td>{item.stok}</td>
                            </tr>
                          </tbody>
                        </table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <div className="flex mt-[30px] gap-[10px] justify-end">
                  <DeletePendingStokModal restok_id={pathId as string}>
                    {({ openModal }) => (
                      <Button variant="danger" onClick={openModal}>
                        Tolak
                      </Button>
                    )}
                  </DeletePendingStokModal>
                  <ButtonLink
                    variant="warning"
                    href={`/pending-stok/${pathId}/edit`}
                    className="px-4"
                  >
                    Edit
                  </ButtonLink>

                  <SubmitModal
                    message="Berhasil menyetujui penambahan stok!"
                    customMessage="Apakah anda yakin ingin menyetujui penambahan stok produk ini?"
                    path="/stok"
                    onSubmit={handleSubmit(onSubmit)}
                    onReset={reset}
                    response={response}
                  >
                    {({ openModal }) => (
                      <Button
                        variant="success"
                        onClick={handleSubmit(() => {
                          openModal();
                        })}
                        isLoading={isPending}
                      >
                        Terima
                      </Button>
                    )}
                  </SubmitModal>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
