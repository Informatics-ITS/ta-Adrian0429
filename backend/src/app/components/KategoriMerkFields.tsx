import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import clsxm from "@/app/lib/clsxm";

type Kategori = {
  id: number;
  nama_jenis: string;
};

type KategoriMerkFieldsProps = {
  merkIndex: number;
  control: Control<any>;
  register: UseFormRegister<any>;
  defaultJenis?: { id: number; nama_jenis: string }[];
};

export function KategoriMerkFields({
  merkIndex,
  control,
  register,
  defaultJenis = [],
}: KategoriMerkFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `merk_request.${merkIndex}.jenis_request`,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["cabang"],
    queryFn: async () => {
      const response = await api.get("/api/jenis");
      return response;
    },
  });

  useEffect(() => {
    if (defaultJenis.length > 0 && fields.length === 0) {
      defaultJenis.forEach((jenis) => {
        append(jenis);
      });
    }
  }, [defaultJenis, append, fields.length]);

  const kategoriOptions = data?.data.data || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = Array.isArray(kategoriOptions)
    ? kategoriOptions.filter((option: Kategori) =>
        option.nama_jenis.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleAppend = (nama_jenis: string) => {
    const isDuplicate = fields.some(
      (field) => (field as any).nama_jenis === nama_jenis
    );

    if (!isDuplicate) {
      const selectedKategori = kategoriOptions.find(
        (option: Kategori) => option.nama_jenis === nama_jenis
      );
      append({ id: selectedKategori?.id, nama_jenis });
      setSearchTerm("");
      setTimeout(() => setShowDropdown(false), 100);
    } else {
      toast.error("Kategori sudah ditambah.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(e.target.value !== "");
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading categories!</p>;

  return (
    <div className="flex flex-row w-full border rounded-lg">
      <div className="flex flex-row max-w-[70%] space-x-2">
        {fields.map((field, categoryIndex) => (
          <div
            key={field.id}
            className="flex my-1 flex-row w-[120px] justify-between px-2 items-center border border-brand-600 rounded-full"
          >
            <input
              className="border-0 w-[75%] rounded-full focus:outline-none active:outline-none"
              {...register(
                `merk_request.${merkIndex}.jenis_request.${categoryIndex}.nama_jenis`
              )}
              readOnly
            />
            {/* <input
              type="hidden"
              {...register(
                `merk_request.${merkIndex}.jenis_request.${categoryIndex}.id`
              )}
            /> */}
            <IoIosCloseCircleOutline
              className="text-xl"
              onClick={() => remove(categoryIndex)}
            />
          </div>
        ))}
      </div>

      <div className="flex w-full min-w-48 items-center space-x-4 relative">
        <input
          type="text"
          className={clsxm(
            "flex w-full rounded-lg shadow-sm",
            "min-h-[2.25rem] md:min-h-[2.5rem]",
            "px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600",
            "focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          )}
          placeholder="Search Kategori"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            refetch();
            setShowDropdown(true);
          }}
          onBlur={handleBlur}
        />

        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute z-10 bg-white border border-gray-300 max-h-40 overflow-y-auto w-full top-full -left-4 mt-[1px]">
            {filteredOptions.map((option: Kategori) => (
              <div
                key={option.id}
                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleAppend(option.nama_jenis)}
              >
                {option.nama_jenis}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
