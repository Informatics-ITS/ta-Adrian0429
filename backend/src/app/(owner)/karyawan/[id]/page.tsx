"use client";

import BreadCrumbs from "@/app/components/BreadCrumbs";
import Button from "@/app/components/button/Button";
import withAuth from "@/app/components/hoc/withAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FiEdit3 } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { KaryawanDeleteModal } from "@/app/(owner)/karyawan/modal/deleteModal";

export default withAuth(KaryawanDetail, "admin");
function KaryawanDetail() {
  const path = usePathname();
  const pathId = path.split("/").pop();

  const breadCrumbs = [
    { href: "/karyawan", Title: "Karyawan" },
    { href: `/karyawan/${pathId}`, Title: "Detail Karyawan" },
  ];

  const { data } = useQuery({
    queryKey: ["karyawan"],
    queryFn: async () => {
      const response = await api.get(`/api/user/${pathId}`);
      return response;
    },
  });

  const karyawan = data?.data.data;

  return (
    <div className="px-8 py-4 h-nav overflow-clip">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <div className="flex flex-row items-center space-x-5">
        <h1 className="text-H1">Detail Karyawan</h1>
        <div className="flex flex-row items-center space-x-1 font-semibold text-brand-600">
          <FiEdit3 />
          <Link href={`${pathId}/edit`} className="">
            edit data
          </Link>
        </div>
      </div>

      <div className="flex flex-row w-fit space-x-5 mt-5">
        <div className="space-y-2 text-S1">
          <p>ID Karyawan</p>
          <p>NIK</p>
          <p>Nama Lengkap</p>
          <p>Email</p>
          <p>No. Handphone</p>
          <p>Role</p>
          <p>Tanggal masuk</p>
          <p>Tempat Lahir</p>
          <p>Tanggal Lahir</p>
          <p>Alamat</p>
        </div>
        <div className="space-y-2 text-S1">
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
        </div>
        <div className="space-y-2 text-B1">
          <p>{karyawan?.id}</p>
          <p>{karyawan?.nik}</p>
          <p>{karyawan?.name}</p>
          <p>{karyawan?.email}</p>
          <p>{karyawan?.no_hp}</p>
          <p>
            {karyawan?.role === "kasirstok" ? "Kasir & Stok" : karyawan?.role}
          </p>
          <p>{karyawan?.tanggal_masuk}</p>
          <p>{karyawan?.tempat_lahir}</p>
          <p>{karyawan?.tanggal_lahir}</p>
          <p>{karyawan?.alamat}</p>
        </div>
      </div>
      <KaryawanDeleteModal id={karyawan?.id}>
        {({ openModal }) => (
          <Button variant="outline danger" className="mt-5" onClick={openModal}>
            Hapus
          </Button>
        )}
      </KaryawanDeleteModal>
    </div>
  );
}
