"use client";
import React, { useState } from "react";
import withAuth from "@/app/components/hoc/withAuth";
import { useSidenavStore } from "@/stores/sidenavStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import PendingStokTabs from "./ReturnHistoryTabs";

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

export default withAuth(RiwayatReturn, "stok");
function RiwayatReturn() {
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

  if (pendingStokLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className={`h-nav p-8 transition-all duration-300`}>
      <div className="w-full mb-8">
        <h1 className="text-H1">Riwayat Return</h1>
      </div>

      <div className="w-full hNavTable max-w-full max-h-hNavTable">
        <PendingStokTabs />
      </div>
    </div>
  );
}
