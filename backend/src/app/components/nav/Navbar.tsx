"use client";
import Input from "../Forms/Input";
import { FiSearch, FiFilter } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import Button from "@/app/components/button/Button";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

export type SearchForm = {
  query: string;
};

type NavbarProps = {
  isTransaksi?: boolean;
};

export default function Navbar({ isTransaksi = false }: NavbarProps) {
  const { user } = useAuthStore();

  const methods = useForm<SearchForm>({
    mode: "onChange",
  });

  const [dateString, setDateString] = useState("");
  const [timeString, setTimeString] = useState("");

  const getCurrentDateTime = () => {
    const now = new Date();
    const optionsDate: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    setDateString(now.toLocaleDateString("id-ID", optionsDate));
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    setTimeString(`${hours} : ${minutes} : ${seconds}`);
  };

  useEffect(() => {
    getCurrentDateTime();
    const intervalId = setInterval(getCurrentDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="hidden lg:flex w-full h-20 px-8 justify-between top-0">
      <div className="w-fit h-fit my-auto">
        <h4 className="text-B1">{dateString}</h4>
        <p className="text-B2 text-neutral-500">{timeString}</p>
      </div>

      <div
        className={cn(
          "flex flex-row items-center justify-between",
          isTransaksi && "w-[60%]"
        )}
      >
        <div
          className={cn(
            "flex flex-row w-[75%] mr-4 justify-between items-baseline",
            !isTransaksi && "hidden"
          )}
        >
          <FormProvider {...methods}>
            <form action="" className="w-[90%]">
              <Input
                id="inputSearch"
                label={""}
                placeholder="Cari Kode Barang, Nama Barang, Kategori"
                leftIcon={FiSearch}
              />
            </form>
          </FormProvider>
          <Button size="icon" icon={FiFilter} className="" />
        </div>

        <div className="h-fit my-auto justify-end">
          <h4 className="text-S1">{user?.name}</h4>
          <p className="text-C1">{user?.role}</p>
        </div>
      </div>
    </div>
  );
}
