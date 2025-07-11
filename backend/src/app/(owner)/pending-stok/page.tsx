"use client";
import React, { useState } from "react";
import withAuth from "@/app/components/hoc/withAuth";
import { useSidenavStore } from "@/stores/sidenavStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import PendingStokTabs from "./PendingStokTabs";

type Kategori = {
  id: number;
  nama_jenis: string;
};

export type PendingStok = {
  restok_id: number;
  barcode: string;
  nama_produk: string;
  merk: string;
  jenis: string;
  cv: string;
  stoks: PendingStokDetail[];
};

export type PendingStokDetail = {
  ukuran: string;
  tanggal_restok: string;
  warna: string;
  stok: number;
};

export type SearchForm = {
  query: string;
};

export default withAuth(PendingStok, "stok");
function PendingStok() {
  // GET CATEGORY LIST
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["jenis"],
    queryFn: async () => {
      const response = await api.get("/api/jenis");
      return response;
    },
  });

  const kategoriData = category?.data.data || [];

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryClick = (kategori: string) => {
    setSelectedCategories((prev) =>
      prev.includes(kategori)
        ? prev.filter((cat) => cat !== kategori)
        : [...prev, kategori]
    );
  };

  // GET ACTIVE PENDING STOK DATA
  const {
    data: pendingStok,
    isLoading: pendingStokLoading,
    refetch: refetchPendingStok,
  } = useQuery({
    queryKey: ["produk"],
    queryFn: async () => {
      const response = await api.get(`/api/produk/pending`);
      return response;
    },
  });

  const pendingStokData = pendingStok?.data?.data;

  const filteredData = Array.isArray(pendingStokData)
    ? selectedCategories.length
      ? pendingStokData.filter((item: PendingStok) =>
          selectedCategories.includes(item.jenis)
        )
      : pendingStokData
    : [];

  const totalProducts = filteredData?.reduce(
    (acc: number, item: PendingStok) => {
      return acc + item.stoks.reduce((sum, detail) => sum + detail.stok, 0);
    },
    0
  );

  if (pendingStokLoading || categoryLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className={`h-nav p-8 transition-all duration-300`}>
      <div className="w-full mb-8">
        <h1 className="text-H1">Pending Stok</h1>
      </div>

      <div className="w-full hNavTable max-w-full max-h-hNavTable">
        <div className="flex overflow-x-auto gap-[10px] custom-scrollbar pb-3">
          {kategoriData?.map((item: Kategori, index: number) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(item.nama_jenis)}
              className={`whitespace-nowrap px-4 py-2 w-fit rounded-3xl border cursor-pointer ${
                selectedCategories.includes(item.nama_jenis)
                  ? "bg-[#FDF0E8] border-[#FDF0E8] text-[#F0661B]"
                  : ""
              }`}
            >
              <p className="text-S4">{item.nama_jenis}</p>
            </div>
          ))}
        </div>
        <PendingStokTabs
          filteredData={filteredData}
          isLoading={pendingStokLoading}
          totalProducts={totalProducts}
        />
      </div>
    </div>
  );
}
