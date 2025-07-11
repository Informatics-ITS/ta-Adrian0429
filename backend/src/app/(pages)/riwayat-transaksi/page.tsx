"use client";
import Button from "@/app/components/button/Button";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FiDownload, FiPrinter } from "react-icons/fi";
import Dropdown2 from "@/app/components/Dropdown2";
import { LuChevronDownSquare } from "react-icons/lu";
import withAuth from "@/app/components/hoc/withAuth";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@/app/components/table/Table";
import Loading from "@/app/components/Loading";
import toast from "react-hot-toast";
import { useIsMobile } from "@/utils/useIsMobile";
import { handlePrintMobile } from "@/utils/printMobile";
import { PrintReceipt } from "@/utils/printReceipt";
import useAuthStore from "@/stores/useAuthStore";

export type SearchPengeluaran = {
  title: string;
};

type ProdukTransaksi = {
  nomor_nota: number;
  produk_id: number;
  barcode_id: number;
  detail_id: number;
  nama_produk: string;
  merk: string;
  jenis: string;
  ukuran: string;
  total_profit: number;
  warna: string;
  tanggal_transaksi: string;
  total_barang: number;
  total_pendapatan: number;
};

type CabangData = {
  id: string;
  name: string;
  alamat: string;
  keterangan: string;
};

type NotaData = {
  id_transaksi: string;
  total_produk: number;
  total_pendapatan: number;
  tanggal_transaksi: string;
  total_profit: number;
  diskon_transaksi: number;
  detail_transaksi: {
    merk: string;
    nama_produk: string;
    jenis: string;
    ukuran: string;
    jumlah_item: number;
    harga_produk: number;
  }[];
};

interface CabangOption {
  id: number;
  label: string;
}

function formatISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateToDDMMYYYY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default withAuth(RiwayatTransaksi, "kasir");
function RiwayatTransaksi() {
  const methods = useForm<SearchPengeluaran>({
    mode: "onChange",
  });

  const now = new Date();
  now.setHours(new Date().getHours() + 7);

  const { user } = useAuthStore();

  const [filter, setFilter] = useState<"nota" | "produk">("nota");

  const [filterStartDate, setFilterStartDate] = useState(formatISODate(now));
  const [filterEndDate, setFilterEndDate] = useState(formatISODate(now));
  const [selectedRange, setSelectedRange] = useState("Hari Ini");
  const [selectedCabang, setSelectedCabang] = useState("Cabang");
  const [selectedCabangId, setSelectedCabangId] = useState(1);

  const { data: cabangData, isLoading: isCabangLoading } = useQuery({
    queryKey: ["cabang"],
    queryFn: async () => {
      const response = await api.get("/api/cabang");
      return response.data;
    },
  });

  const cabangOptions: CabangOption[] =
    cabangData?.data?.data?.map((item: CabangData) => ({
      id: item.id,
      label: item.name,
    })) || [];

  const handleDateFilterChange = (selected: string) => {
    const now = new Date();
    now.setHours(new Date().getHours() + 7);

    switch (selected) {
      case "Hari Ini":
        setFilterStartDate(formatISODate(now));
        setFilterEndDate(formatISODate(now));
        setSelectedRange("Hari Ini");
        break;
      case "1 Minggu":
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        setFilterStartDate(formatISODate(weekAgo));
        setFilterEndDate(formatISODate(now));
        setSelectedRange("1 Minggu");
        break;
      case "1 Bulan":
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        setFilterStartDate(formatISODate(monthAgo));
        setFilterEndDate(formatISODate(now));
        setSelectedRange("1 Bulan");
        break;
    }
  };

  const handleCabangChange = (selected: string) => {
    setSelectedCabang(selected);

    const selectedCabang = cabangOptions.find(
      (option) => option.label === selected
    );
    if (selectedCabang) {
      setSelectedCabangId(selectedCabang.id);
    }
  };

  const {
    data,
    refetch: refetchTransaksi,
    isLoading,
  } = useQuery({
    queryKey: [
      "transaksi",
      filter,
      selectedCabangId,
      filterStartDate,
      filterEndDate,
    ],
    queryFn: async () => {
      let start_date = formatISODate(now);
      let end_date = formatISODate(now);

      if (filterStartDate && filterEndDate) {
        start_date = filterStartDate;
        end_date = filterEndDate;
      }

      const response = await api.get(
        `/api/transaksi?&filter=${filter}&cabang=${selectedCabangId}`,
        {
          params: {
            start_date,
            end_date,
          },
        }
      );

      return response.data;
    },
  });

  const historyData = data?.data?.data || [];

  const downloadQuery = useQuery({
    queryKey: ["download"],
    queryFn: async () => {
      let start_date = formatISODate(now);
      let end_date = formatISODate(now);

      if (filterStartDate && filterEndDate) {
        start_date = filterStartDate;
        end_date = filterEndDate;
      }

      const response = await api.get(
        `/api/transaksi/download?&filter=${filter}&cabang=${selectedCabangId}`,
        {
          responseType: "blob",
          params: {
            start_date,
            end_date,
          },
        }
      );
      return response.data;
    },
    enabled: false,
  });

  const { refetch: refetchDownload, isFetching } = downloadQuery;

  const handleDownload = async () => {
    let start_date = formatISODate(now);
    let end_date = formatISODate(now);

    if (filterStartDate && filterEndDate) {
      start_date = filterStartDate;
      end_date = filterEndDate;
    }

    try {
      const fileData = await refetchDownload();

      const blob = new Blob([fileData.data], { type: fileData.data.type });
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `History Transaksi ${start_date} - ${end_date}.xlsx`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh data");
    }
  };

  const isMobile = useIsMobile();

  const handlePrint = async (id: string | number) => {
    try {
      if (isMobile) {
        await handlePrintMobile(id);
      } else {
        await PrintReceipt(id);
      }
      toast.success("Struk berhasil dicetak!");
    } catch (error) {
      toast.error("Gagal mencetak struk");
      // console.error("Print error:", error);
    }
  };

  useEffect(() => {
    refetchTransaksi();
  }, [filter, selectedCabangId, refetchTransaksi]);

  const NotaColumns: ColumnDef<NotaData>[] = [
    {
      accessorKey: "id_transaksi",
      header: "Kode Nota",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "merk",
      header: "Merk",
      accessorFn: (row) => row.detail_transaksi,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<NotaData["detail_transaksi"]>().map((detail, idx) => (
            <span key={idx}>{detail.merk}</span>
          ))}
        </div>
      ),
    },
    {
      id: "nama_produk",
      header: "Nama",
      accessorFn: (row) => row.detail_transaksi,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<NotaData["detail_transaksi"]>().map((detail, idx) => (
            <span key={idx}>{detail.nama_produk}</span>
          ))}
        </div>
      ),
    },
    {
      id: "jenis",
      header: "Kategori Barang",
      accessorFn: (row) => row.detail_transaksi,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<NotaData["detail_transaksi"]>().map((detail, idx) => (
            <span key={idx}>{detail.jenis}</span>
          ))}
        </div>
      ),
    },
    {
      id: "ukuran",
      header: "Ukuran",
      accessorFn: (row) => row.detail_transaksi,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<NotaData["detail_transaksi"]>().map((detail, idx) => (
            <span key={idx}>{detail.ukuran}</span>
          ))}
        </div>
      ),
    },
    {
      id: "jumlah_item",
      header: "Jumlah Item",
      accessorFn: (row) => row.detail_transaksi,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<NotaData["detail_transaksi"]>().map((detail, idx) => (
            <span key={idx}>{detail.jumlah_item}</span>
          ))}
        </div>
      ),
    },
    {
      id: "harga_produk",
      header: "Harga per Item",
      accessorFn: (row) => row.detail_transaksi,
      cell: (props) => (
        <div className="grid gap-y-4">
          {props.getValue<NotaData["detail_transaksi"]>().map((detail, idx) => (
            <span key={idx}>
              Rp. {detail.harga_produk.toLocaleString("id-en")}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "total_produk",
      header: "Total Item",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "diskon_transaksi",
      header: "Diskon Transaksi",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "total_pendapatan",
      header: "Total Pendapatan",
      cell: (props) => (
        <span>Rp. {Number(props.getValue()).toLocaleString("id-ID")}</span>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    ...(user?.role === "admin"
      ? [
          {
            accessorKey: "total_profit",
            header: "Profit",
            cell: (props: any) => (
              <span>
                Rp. {Number(props.getValue()).toLocaleString("id-ID")}
              </span>
            ),
            filterFn: (row: any, id: any, value: any) =>
              value.includes(row.getValue(id)),
          },
        ]
      : []),
    {
      accessorKey: "tanggal_transaksi",
      header: "Tanggal",
      cell: (props) => (
        <span>{formatDateToDDMMYYYY(props.getValue() as string)}</span>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "print",
      header: "Cetak",
      cell: (props) => (
        <Button
          className="ml-auto w-fit"
          onClick={() => handlePrint(props.row.original.id_transaksi)}
        >
          <FiPrinter className="w-fit" />
        </Button>
      ),
    },
  ];

  const BarangColumns: ColumnDef<ProdukTransaksi>[] = [
    {
      accessorKey: "nomor_nota",
      header: "Nota",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "barcode_id",
      header: "Barcode",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "nama_produk",
      header: "Nama",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "merk",
      header: "Merk",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "jenis",
      header: "Kategori",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "ukuran",
      header: "Ukuran",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "warna",
      header: "Warna",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "total_barang",
      header: "Terjual",
      cell: (props) => <span>{props.getValue() as string}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "total_pendapatan",
      header: "Total Pendapatan",
      cell: (props) => (
        <span>Rp. {Number(props.getValue()).toLocaleString("id-ID")}</span>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    ...(user?.role === "admin"
      ? [
          {
            accessorKey: "total_profit",
            header: "Profit",
            cell: (props: any) => (
              <span>
                Rp. {Number(props.getValue()).toLocaleString("id-ID")}
              </span>
            ),
            filterFn: (row: any, id: any, value: any) => {
              return value.includes(row.getValue(id));
            },
          },
        ]
      : []),
    {
      accessorKey: "tanggal_transaksi",
      header: "Tanggal",
      cell: (props) => (
        <span>{formatDateToDDMMYYYY(props.getValue() as string)}</span>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "print",
      header: "Cetak",
      cell: (props) => (
        <Button
          className="w-fit ml-auto mr-1"
          onClick={() => handlePrint(props.row.original.nomor_nota)}
        >
          <FiPrinter className="w-fit" />
        </Button>
      ),
    },
  ];

  if (isLoading || isCabangLoading) {
    return <Loading />;
  }

  return (
    <div className="h-nav justify-between px-8 py-4">
      <h1 className="text-H1">RIWAYAT TRANSAKSI</h1>
      <div className="flex justify-between mt-8">
        <div className="flex w-full space-x-5 justify-between">
          <FormProvider {...methods}>
            <div className="flex lg:space-x-4 lg:items-center max-lg:flex-col max-lg:gap-2">
              <Dropdown2
                id="range"
                contents={["Hari Ini", "1 Minggu", "1 Bulan"]}
                title={selectedRange}
                onChange={handleDateFilterChange}
                className="max-lg:w-fit"
              />
              <div className="flex items-center lg:space-x-4 space-x-2">
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="flex w-fit rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600"
                />
                <span className="">-</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="flex w-fit rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600"
                />
              </div>
            </div>
            <div className="flex lg:space-x-4 max-lg:flex-col-reverse max-lg:gap-2">
              <Dropdown2
                id="order"
                contents={cabangOptions.map((opt) => opt.label)}
                title={selectedCabang}
                onChange={handleCabangChange}
              />
              <Button
                className="max-h-12 w-full px-4"
                variant="outline"
                leftIcon={FiDownload}
                onClick={handleDownload}
                disabled={isFetching}
              >
                {isFetching ? "Mengunduh..." : "Unduh Data"}
              </Button>
            </div>
          </FormProvider>
        </div>
      </div>

      <div className="border-b border-gray-200 mt-6">
        <nav
          className="-mb-0.5 flex justify-center space-x-6"
          aria-label="Tabs"
          role="tablist"
        >
          <button
            type="button"
            className={cn(
              `"font-semibold w-full font-semibold py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none active" ${
                filter === "nota" &&
                "border-brand-600 text-brand-600 font-semibold"
              }`
            )}
            onClick={() => {
              setFilter("nota");
              refetchTransaksi();
            }}
          >
            Nota
          </button>
          <button
            type="button"
            className={cn(
              `"font-semibold w-full font-semibold py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none active" ${
                filter === "produk" &&
                "border-brand-600 text-brand-600 font-semibold"
              }`
            )}
            onClick={() => {
              setFilter("produk");
              refetchTransaksi();
            }}
          >
            Barang
          </button>
        </nav>
      </div>

      <div className="mt-8">
        {filter === "nota" ? (
          <>
            <Table
              className="text-black"
              tableClassName="max-h-[45vh]"
              data={historyData}
              columns={NotaColumns}
              columnToggle={{
                enabled: true,
                title: "Tampilkan",
                className: "overflow-y-auto max-h-[350px]",
              }}
              isLoading={isLoading}
              withFilter
              footers={
                <div
                  className={`flex justify-end mr-2 ${
                    user?.role === "admin" ? "" : "hidden"
                  }`}
                >
                  Total Profit: Rp.{" "}
                  {data?.data.sum_total_profit.toLocaleString("id-en")}
                </div>
              }
            />
          </>
        ) : (
          <>
            <Table
              className="text-black"
              tableClassName="max-h-[45vh]"
              data={historyData}
              columns={BarangColumns}
              columnToggle={{
                enabled: true,
                title: "Tampilkan",
                className: "overflow-y-auto max-h-[350px]",
              }}
              isLoading={isLoading}
              withFilter
              footers={
                <div
                  className={`flex justify-end mr-2 ${
                    user?.role === "admin" ? "" : "hidden"
                  }`}
                >
                  Total Profit: Rp.{" "}
                  {data?.data.sum_total_profit.toLocaleString("id-en")}
                </div>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
