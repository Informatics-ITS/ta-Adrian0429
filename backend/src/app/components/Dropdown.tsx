import React, {useEffect, useRef, useState} from "react";
import {FiChevronDown} from "react-icons/fi";
import Button from "./button/Button";
import {cn} from "@/lib/utils";

interface DropdownProps {
    sizes: string[];
    title: React.ReactNode;
    type: string;
    className?: string;
    link?: string[];
    withLink?: boolean;
    onFilterChange?: (selected: string[]) => void;
    onFormatChange?: (format: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
                                               sizes,
                                               title,
                                               type,
                                               className,
                                               link = [],
                                               withLink = false,
                                               onFilterChange,
                                               onFormatChange,
                                           }) => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>(sizes);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOptionClick = (size: string) => {
        if (type === "base") {
            onFilterChange?.([size]);
            onFormatChange?.(size);
            setIsOpen(false);
        }
    };

    const handleCheckboxChange = (size: string) => {
        setSelectedFilters((prev) =>
            prev.includes(size)
                ? prev.filter((filter) => filter !== size)
                : [...prev, size]
        );
    };

    const handleSave = () => {
        if (onFilterChange) onFilterChange(selectedFilters);
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedFilters(sizes);
        if (onFilterChange) onFilterChange(sizes);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative inline-flex justify-center items-center" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className={cn(
                    "py-2 px-2 inline-flex items-center gap-x-2 min-w-[70%] text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none",
                    `${className}`
                )}
            >
                <p className="w-full text-center text-B3">{title}</p>
                <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`}/>
            </button>

            {type === "base" ? (
                <div
                    className={`absolute top-full mt-1 z-20 bg-white shadow-md rounded-lg p-1 min-w-[200px] ${
                        isOpen ? "block" : "hidden"
                    }`}
                    style={{
                        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                    }}
                >
                    {sizes.map((size, index) =>
                        withLink && link[index] ? (
                            <a
                                key={index}
                                href={link[index]}
                                className="flex items-center my-1 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                rel="noopener noreferrer"
                            >
                                {size}
                            </a>
                        ) : (
                            <div
                                key={index}
                                className="flex items-center my-1 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 cursor-pointer"
                                onClick={() => handleOptionClick(size)}
                            >
                                {size}
                            </div>
                        )
                    )}
                </div>
            ) : (
                <div
                    className={`absolute top-full mt-1 z-20 bg-white shadow-md rounded-lg p-2 min-w-[240px] ${
                        isOpen ? "block" : "hidden"
                    } ${className}`}
                    style={{
                        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                    }}
                >
                    {sizes.map((size, index) => (
                        <div
                            key={index}
                            className="relative flex items-start my-1 py-2 px-3 rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex justify-between items-center w-full">
                                <p>{size}</p>
                                <input
                                    type="checkbox"
                                    name={size}
                                    checked={selectedFilters.includes(size)}
                                    onChange={() => handleCheckboxChange(size)}
                                    className="shrink-0 border-gray-200 rounded focus:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none accent-brand-600"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end w-full mt-2 space-x-2">
                        <Button size="small" variant="outline primary" onClick={handleClear}>
                            Reset
                        </Button>
                        <Button size="small" variant="primary" onClick={handleSave}>
                            Simpan
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown