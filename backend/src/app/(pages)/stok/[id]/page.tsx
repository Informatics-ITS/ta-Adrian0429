"use client";
import { FormProvider, useForm } from "react-hook-form";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import ButtonLink from "@/app/components/button/ButtonLink";
import withAuth from "@/app/components/hoc/withAuth";
import useAuthStore from "@/stores/useAuthStore";

type DetailStok = {
  id: number;
  barcode: string;
  nama_produk: string;
  merk: string;
  jenis: string;
  cv: string;
  harga_jual: number;
  harga_beli: number;
  supplier: string;
  supplier_id: number;
  stoks: DetailProduk[];
};

type DetailProduk = {
  tanggal_restok: string;
  ukuran: string;
  warna: string;
  stok: number;
};

const formatDate = (utcDateStr: string): string => {
  const utcDate = new Date(utcDateStr);
  return format(utcDate, "d MMMM yyyy", { locale: id });
};
export default withAuth(DetailStok, "stok");
function DetailStok() {
  const methods = useForm<DetailStok>({
    mode: "onChange",
  });

  const router = useRouter();
  const path = usePathname();
  const pathId = path.split("/").pop();
  const { user } = useAuthStore();

  const breadCrumbs = [
    { href: "/stok", Title: "Stok" },
    { href: `/stok/${pathId}`, Title: "Detail Stok" },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["produk"],
    queryFn: async () => {
      const response = await api.get(`/api/produk/${pathId}`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return <div className="px-8">Loading...</div>;
  }

  if (isError || !data?.stoks) {
    return <div className="px-8">Error fetching data.</div>;
  }

  return (
    <div className="h-full px-8 py-4 overflow-y-auto">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <h1 className="text-H1">Detail Stok</h1>

      <div className="flex flex-col w-full mt-8">
        <FormProvider {...methods}>
          <form>
            <div className="flex justify-between items-start">
              <h1 className="text-D2">{data?.nama_produk}</h1>
            </div>
            <div className="flex gap-[100px] items-start mt-[50px] h-full">
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
                    {user?.role === "admin" && (
                      <>
                        <tr>
                          <td className="text-S1">Harga Beli</td>
                          <td>:</td>
                          <td>Rp {data?.harga_beli.toLocaleString("id-en")}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="text-S1">Harga Jual</td>
                      <td>:</td>
                      <td>Rp {data?.harga_jual.toLocaleString("id-en")}</td>
                    </tr>
                    <tr>
                      <td className="text-S1">Supplier</td>
                      <td>:</td>
                      <td>{data?.supplier_name}</td>
                    </tr>
                  </tbody>
                </table>
                <ButtonLink
                  href={`/stok/${pathId}/restok`}
                  className="py-2 w-[200px] mt-[50px]"
                >
                  Restok
                </ButtonLink>
              </div>

              <div className="w-full h-full bg-white">
                <Accordion
                  type="multiple"
                  className="w-full"
                  defaultValue={data.stoks.map(
                    (_item: DetailStok, index: number) => index.toString()
                  )}
                >
                  {data.stoks.map((item: DetailProduk, index: number) => (
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
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
