"use client";
import Button from "@/app/components/button/Button";
import React, { useState } from "react";
import withAuth from "@/app/components/hoc/withAuth";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@/app/components/table/Table";
import Loading from "@/app/components/Loading";
import { AiOutlineLoading } from "react-icons/ai";
import toast from "react-hot-toast";
import { se } from "date-fns/locale";
import { SubmitModal } from "@/app/components/modal/variants/submitModal";

type UserReturn = {
  id_transaksi: number;
  tanggal_transaksi: string;
  total_harga: number;
  metode_bayar: string;
  diskon: number;
  detail_transaksi: {
    detail_transaksi_id: number;
    detail_produk_id: number;
    merk: string;
    nama_produk: string;
    jenis: string;
    ukuran: string;
    jumlah_item: number;
    harga_produk: number;
  }[];
};

type SupplierReturn = {
  restok_id: number;
  id_produk: number;
  barcode: string;
  nama_produk: string;
  merk: string;
  jenis: string;
  cv: string;
  supplier: string;
  harga_jual: number;
  stoks: {
    detail_restok_id: number;
    detail_produk_id: number;
    ukuran: string;
    warna: string;
    jumlah: number;
  }[];
};

function formatDateToDDMMYYYY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default withAuth(ReturnPage, "kasirstok");
function ReturnPage() {
  const [filter, setFilter] = useState<"user" | "supplier">("user");
  const [inputId, setInputId] = useState<string>("");
  const [searchId, setSearchId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [alasan, setAlasan] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [response, setResponse] = useState("not submitted");

  const { data, isLoading } = useQuery({
    queryKey: ["transaksi", filter, searchId],
    queryFn: async () => {
      if (!searchId) return null;

      try {
        const response = await api.get(`/api/return/${filter}/${searchId}`);
        const newQuantities: Record<number, number> = {};
        if (filter === "user") {
          response.data.data.detail_transaksi.forEach((item: any) => {
            newQuantities[item.detail_transaksi_id] = item.jumlah_item;
          });
        } else {
          response.data.data.stoks.forEach((item: any) => {
            newQuantities[item.detail_restok_id] = item.jumlah_stok;
          });
        }
        setQuantities(newQuantities);
        setError("");
        return response.data;
      } catch (error) {
        setError("Data tidak ditemukan");
        return null;
      }
    },
    enabled: !!searchId,
  });

  const handleQuantityChange = (id: number, value: number) => {
    const maxQuantity =
      filter === "user"
        ? data?.data.detail_transaksi.find(
            (item: any) => item.detail_transaksi_id === id
          )?.jumlah_item
        : data?.data.stoks.find((item: any) => item.detail_restok_id === id)
            ?.jumlah_stok;

    const newValue = Math.max(0, Math.min(value, maxQuantity || 0));
    setQuantities((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const QuantityControl = ({ id, value }: { id: number; value: number }) => (
    <div className="relative flex items-center justify-between mx-auto bg-gray-100 rounded-full px-2 py-1 shadow-sm w-fit">
      <button
        type="button"
        onClick={() => handleQuantityChange(id, value - 1)}
        className="w-8 h-8 text-2xl font-medium flex items-center justify-center text-black bg-white rounded-full shadow hover:bg-gray-200"
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value, 10) || 0;
          handleQuantityChange(id, newValue);
        }}
        className="text-center text-B2 bg-transparent text-black w-8 no-arrows outline-none"
      />
      <button
        type="button"
        onClick={() => handleQuantityChange(id, value + 1)}
        className="w-8 h-8 text-xl font-medium flex items-center justify-center text-orange-600 bg-white rounded-full shadow hover:bg-gray-200"
      >
        +
      </button>
    </div>
  );

  const handleSubmit = () => {
    if (!inputId) {
      setError("Masukkan ID terlebih dahulu");
      return;
    }
    setSearchId(inputId);
  };

  const handleReturnRequest = async () => {
    if (!data) {
      setError("Data tidak ditemukan");
      return;
    }
    if (!alasan) {
      toast.error("Mohon isi alasan return");
      return;
    }

    const payload = {
      [filter === "user" ? "id_transaksi" : "restok_id"]:
        filter === "user" ? data.data.id_transaksi : data.data.restok_id,
      alasan,
      detail_transaksi: Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id, jumlah_item]) => ({
          [filter === "user" ? "detail_transaksi_id" : "detail_restok_id"]:
            parseInt(id),
          detail_produk_id:
            filter === "user"
              ? data.data.detail_transaksi.find(
                  (item: any) => item.detail_transaksi_id === parseInt(id)
                )?.detail_produk_id
              : data.data.stoks.find(
                  (item: any) => item.detail_restok_id === parseInt(id)
                )?.detail_produk_id,
          jumlah_item,
        })),
    };

    try {
      await api.post(`/api/return/${filter}`, payload);
      //   console.log(payload);
      setResponse("submitted");
      setError("");
      setAlasan("");
      setSearchId("");
      setInputId("");
      setQuantities({});
    } catch (error) {
      setError("Gagal menyimpan return");
    }
  };

  const handleReset = () => {
    setResponse("not submitted");
    setError("");
    setAlasan("");
    setSearchId("");
    setInputId("");
    setQuantities({});
  };

  const UserColumns: ColumnDef<UserReturn["detail_transaksi"][0]>[] = [
    {
      accessorKey: "detail_transaksi_id",
      header: "ID Transaksi",
    },
    {
      accessorKey: "detail_produk_id",
      header: "ID Produk",
    },
    {
      accessorKey: "merk",
      header: "Merk",
    },
    {
      accessorKey: "nama_produk",
      header: "Nama Produk",
    },
    {
      accessorKey: "jenis",
      header: "Jenis",
    },
    {
      accessorKey: "ukuran",
      header: "Ukuran",
    },
    {
      accessorKey: "jumlah_item",
      header: "Sisa Item",
      cell: (props) => (
        <QuantityControl
          id={props.row.original.detail_transaksi_id}
          value={quantities[props.row.original.detail_transaksi_id] || 0}
        />
      ),
    },
    {
      accessorKey: "harga_produk",
      header: "Harga",
      cell: (props) => (
        <span>Rp. {Number(props.getValue()).toLocaleString("id-ID")}</span>
      ),
    },
  ];

  const SupplierColumns: ColumnDef<SupplierReturn["stoks"][0]>[] = [
    // {
    //   accessorKey: "detail_restok_id",
    //   header: "ID Restok",
    // },
    // {
    //   accessorKey: "detail_produk_id",
    //   header: "ID Produk",
    // },
    {
      accessorKey: "ukuran",
      header: "Ukuran",
    },
    {
      accessorKey: "warna",
      header: "Warna",
    },
    {
      accessorKey: "jumlah_restok",
      header: "Jumlah Restok",
    },
    {
      accessorKey: "jumlah_stok",
      header: "Stok",
    },
    {
      accessorKey: "jumlah_restok",
      header: "Sisa Item",
      cell: (props) => (
        <QuantityControl
          id={props.row.original.detail_restok_id}
          value={quantities[props.row.original.detail_restok_id] || 0}
        />
      ),
    },
  ];

  return (
    <div className="h-nav justify-between px-8 py-4">
      <h1 className="text-H1">RETURN BARANG</h1>

      <div className="border-b border-gray-200 mt-6">
        <nav
          className="-mb-0.5 flex justify-center space-x-6"
          aria-label="Tabs"
          role="tablist"
        >
          <button
            type="button"
            className={cn(
              "font-semibold w-full py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600",
              filter === "user" && "border-brand-600 text-brand-600"
            )}
            onClick={() => {
              setFilter("user");
              setInputId("");
              setSearchId("");
              setError("");
            }}
          >
            Return Konsumen
          </button>
          <button
            type="button"
            className={cn(
              "font-semibold w-full py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600",
              filter === "supplier" && "border-brand-600 text-brand-600"
            )}
            onClick={() => {
              setFilter("supplier");
              setInputId("");
              setSearchId("");
              setError("");
            }}
          >
            Return Supplier
          </button>
        </nav>
      </div>

      <div className="flex justify-between mt-8 mb-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder={`Masukkan ID ${
              filter === "user" ? "Transaksi" : "Restok"
            }`}
            className="border p-2 rounded"
          />
          <Button variant="primary" onClick={handleSubmit}>
            Cari
          </Button>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Alasan return"
            className="border p-2 rounded"
          />
          <SubmitModal
            message="Return barang berhasil!"
            path={`${filter === "user" ? "/riwayat-transaksi" : "/stok"}`}
            onSubmit={handleReturnRequest}
            onReset={handleReset}
            response={response}
          >
            {({ openModal }) => (
              <Button
                variant="primary"
                onClick={() => {
                  openModal();
                }}
              >
                Simpan
              </Button>
            )}
          </SubmitModal>
        </div>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center text-5xl text-gray-600 animate-spin">
            <AiOutlineLoading />
          </div>
        ) : (
          data?.data && (
            <>
              {filter === "user" ? (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      Tanggal:{" "}
                      {formatDateToDDMMYYYY(data.data.tanggal_transaksi)}
                    </div>
                    <div>
                      Total Harga: Rp.{" "}
                      {data.data.total_harga.toLocaleString("id-ID")}
                    </div>
                    <div>Metode Bayar: {data.data.metode_bayar}</div>
                    <div>Diskon: {data.data.diskon}%</div>
                  </div>
                  <Table
                    className="text-black"
                    tableClassName="max-h-[45vh]"
                    data={data.data.detail_transaksi}
                    columns={UserColumns}
                    isLoading={false}
                  />
                </>
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>Barcode: {data.data.barcode}</div>
                    <div>Nama Produk: {data.data.nama_produk}</div>
                    <div>Merk: {data.data.merk}</div>
                    <div>Jenis: {data.data.jenis}</div>
                    <div>CV: {data.data.cv}</div>
                    <div>Supplier: {data.data.supplier}</div>
                    <div>
                      Harga Jual: Rp.{" "}
                      {data.data.harga_jual.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <Table
                    className="text-black"
                    tableClassName="max-h-[35vh]"
                    data={data.data.stoks}
                    columns={SupplierColumns}
                    isLoading={false}
                  />
                </>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
