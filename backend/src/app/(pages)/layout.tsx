"use client";
import { ReactNode } from "react";
import Sidenav from "@/app/components/nav/Sidenav";
import Navbar from "@/app/components/nav/Navbar";
import { FiFileText, FiShoppingBag, FiShoppingCart } from "react-icons/fi";
import { FaRegBuilding, FaRegUser, FaWarehouse } from "react-icons/fa";
import { MdOutlineRemoveShoppingCart } from "react-icons/md";
import { TbShoppingBagCheck } from "react-icons/tb";
import { BiWallet } from "react-icons/bi";
import { GoHistory } from "react-icons/go";
import { usePathname } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";

type ChildrenLayoutProps = {
  children: ReactNode;
};

const AllNavbarLinks = [
  {
    title: "CV",
    icon: FaWarehouse,
    link: "/cv",
  },
  {
    title: "Supplier",
    icon: FaRegBuilding,
    link: "/supplier",
  },
  {
    title: "Karyawan",
    icon: FaRegUser,
    link: "/karyawan",
  },
  {
    title: "Pending Stok",
    icon: FiFileText,
    link: "/pending-stok",
  },
  {
    title: "Pengeluaran",
    icon: BiWallet,
    link: "/pengeluaran",
  },
  {
    title: "Riwayat Akses",
    icon: GoHistory,
    link: "/riwayat-akses",
  },
  {
    title: "Riwayat Transaksi",
    icon: GoHistory,
    link: "/riwayat-transaksi",
  },
  {
    title: "Stok",
    icon: FiShoppingBag,
    link: "/stok",
  },
  {
    title: "Final Stok",
    icon: TbShoppingBagCheck,
    link: "/final-stok",
  },
  {
    title: "Return Barang",
    icon: MdOutlineRemoveShoppingCart,
    link: "/return",
  },
  {
    title: "Riwayat Return",
    icon: GoHistory,
    link: "/riwayat-return",
  },
  {
    title: "Transaksi",
    icon: FiShoppingCart,
    link: "/transaksi",
  },
];

const filterNavbarLinks = (role: string) => {
  switch (role) {
    case "admin":
      return AllNavbarLinks;
    case "stok":
      return AllNavbarLinks.filter(
        (link) =>
          link.link === "/stok" ||
          link.link === "/riwayat-return" ||
          link.link === "/return"
      );
    case "kasir":
      return AllNavbarLinks.filter(
        (link) =>
          link.link === "/transaksi" ||
          link.link === "/riwayat-transaksi" ||
          link.link === "/stok" ||
          link.link === "/return"
      );
    case "kasirstok":
      return AllNavbarLinks.filter(
        (link) =>
          link.link === "/stok" ||
          link.link === "/transaksi" ||
          link.link === "/riwayat-transaksi"
      );
    default:
      return [];
  }
};

const ChildrenLayout = ({ children }: ChildrenLayoutProps) => {
  const pathname = usePathname();
  const isTransaksi = pathname === "/transaksi";

  const user = useAuthStore.useUser();

  const NavbarLinks = filterNavbarLinks(user?.role || "");

  return (
    <div className="flex max-h-screen h-screen max-w-screen w-screen">
      <Sidenav topNav={NavbarLinks} />
      <div className="hidden sm:flex flex-col max-h-screen h-full w-full">
        <Navbar isTransaksi={isTransaksi} />
        <div className="max-h-screen h-nav pt-20 lg:pt-0">{children}</div>
      </div>
    </div>
  );
};

export default ChildrenLayout;
