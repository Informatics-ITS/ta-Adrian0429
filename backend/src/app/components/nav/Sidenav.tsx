"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
} from "react-icons/fi";

import { IconType } from "react-icons";
import Button from "@/app/components/button/Button";
import { LogOut } from "@/app/components/modal/logout/logoutModal";
import { useSidenavStore } from "@/stores/sidenavStore";

type SidenavProps = {
  topNav: {
    title: string;
    icon: IconType;
    link: string;
  }[];
};

export default function Sidenav({ topNav }: SidenavProps) {
  const { isOpen, toggleSidenav } = useSidenavStore();
  const path = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  // Function to handle mobile link clicks
  const handleMobileNavClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidenav */}
      <div
        className={`hidden lg:flex flex-col justify-between transition-all duration-300 ${
          isOpen ? "w-56" : "w-20"
        } h-screen bg-white shadow-lg py-6`}
      >
        <div className="w-full">
          <div className="relative w-full mb-6 flex justify-center">
            <Button
              icon={isOpen ? FiChevronLeft : FiChevronRight}
              size="icon"
              className="absolute top-0 right-0 translate-x-5"
              onClick={toggleSidenav}
            />
            <Link href="/">
              <h2 className="text-xl font-bold text-brand-600">
                {isOpen ? "UD. BUMI SUBUR" : "BS"}
              </h2>
            </Link>
          </div>
          <div className="">
            {topNav.map((link) => (
              <Link
                href={link.link}
                key={link.title}
                className={`flex items-center mx-4 my-3 py-3 rounded-lg transition-colors ${
                  path === link.link
                    ? "bg-brand-600 text-white"
                    : "hover:bg-gray-100"
                } ${isOpen ? "px-4 space-x-4" : "justify-center"}`}
              >
                <link.icon className="text-xl" />
                {isOpen && <p className="text-sm">{link.title}</p>}
              </Link>
            ))}
          </div>
        </div>
        <LogOut>
          {({ openModal }) => (
            <div
              onClick={openModal}
              className={`flex items-center cursor-pointer mx-4 my-6 hover:text-brand-600 ${
                isOpen ? "px-4 space-x-4" : "justify-center"
              }`}
            >
              <FiLogOut className="text-xl" />
              {isOpen && <p className="text-sm">Keluar</p>}
            </div>
          )}
        </LogOut>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
        <Link
          href="/"
          onClick={handleMobileNavClick}
          className="text-lg font-bold text-brand-600"
        >
          UD. BUMI SUBUR
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 border rounded-lg bg-white shadow-sm hover:bg-gray-100"
        >
          <FiMenu className="text-xl" />
        </button>
      </header>

      {/* Mobile Navigation */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0"
              onClick={() => setIsMobileOpen(false)}
            />
            <nav className="relative h-full w-full bg-white shadow-xl">
              <div className="h-16" /> {/* Spacer for header */}
              <div className="overflow-y-auto h-[calc(100vh-10rem)] p-4 space-y-3">
                {topNav.map((link) => (
                  <Link
                    href={link.link}
                    key={link.title}
                    onClick={handleMobileNavClick}
                    className={`flex items-center space-x-4 py-2 rounded-lg px-4 border transition-colors ${
                      path === link.link
                        ? "bg-brand-600 text-white"
                        : "hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <link.icon className="text-lg" />
                    <p className="text-sm">{link.title}</p>
                  </Link>
                ))}
                <LogOut>
                  {({ openModal }) => (
                    <div
                      onClick={() => {
                        openModal();
                        handleMobileNavClick();
                      }}
                      className="flex items-center space-x-4 py-2 px-4 cursor-pointer hover:text-brand-600"
                    >
                      <FiLogOut className="text-lg" />
                      <p className="text-sm">Keluar</p>
                    </div>
                  )}
                </LogOut>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
