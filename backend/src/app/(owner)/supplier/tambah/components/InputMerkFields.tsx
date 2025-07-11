import {Control, useFieldArray, UseFormRegister} from "react-hook-form";
import {useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import {useEffect, useState} from "react";
import clsxm from "@/app/lib/clsxm";

type Merk = {
    merk: string;
};

type MerkFieldsProps = {
    merkIndex: string;
    control: Control<any>;
    register: UseFormRegister<any>;
    value: string;
    isError?: boolean;
    onChange: (value: string) => void;
};

export function InputMerk({
                              merkIndex,
                              control,
                              value,
                              isError = false,
                              onChange,
                          }: MerkFieldsProps) {
    const {append} = useFieldArray({
        control,
        name: `${merkIndex}`,
    });

    const {data, isLoading, error, refetch} = useQuery({
        queryKey: ["cabang"],
        queryFn: async () => {
            const response = await api.get("/api/supplier/index");
            return response;
        },
    });

    const merkOptions: Merk[] = data?.data?.data?.Merk || [];

    const [searchTerm, setSearchTerm] = useState(value);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const filteredOptions = merkOptions.filter(
        (option: Merk) =>
            option.merk &&
            option.merk.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAppend = (value: string) => {
        append({value});
        onChange(value);
        setSearchTerm(value);
        setShowDropdown(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue);
        setShowDropdown(newValue !== "");
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowDropdown(false);
        }, 200);
    };

    if (isLoading) return <p>Loading</p>;
    if (error) return <p>Error</p>;

    return (
        <div className="flex flex-col w-full">
            <div className="relative">
                <input
                    type="text"
                    className={clsxm(
                        "flex w-full rounded-lg shadow-sm",
                        "min-h-[2.25rem] md:min-h-[2.5rem]",
                        "px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600",
                        "focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600",
                        isError &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500 caret-red-600"
                    )}
                    placeholder="Search Merk"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => {
                        refetch();
                        setShowDropdown(true);
                    }}
                    onBlur={handleBlur}
                />
                {isError && <h5 className="mt-1 text-red-500">Merk harus diisi</h5>}

                {showDropdown && (
                    <div
                        className="absolute z-10 bg-white border mt-[1px] border-gray-300 max-h-40 overflow-y-auto w-full custom-scrollbar top-full rounded-b-xl">
                        {filteredOptions.length > 0 &&
                            filteredOptions.map((option: Merk, id: number) => (
                                <div
                                    key={id}
                                    className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent blur event from firing
                                        handleAppend(option.merk);
                                    }}
                                >
                                    {option.merk}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
