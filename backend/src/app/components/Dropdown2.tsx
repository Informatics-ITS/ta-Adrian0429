"use client";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

export type DropdownProps = {
  id: string;
  contents: string[] | string;
  title: string;
  errorMessage?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

const Dropdown2: React.FC<DropdownProps> = ({
  id,
  contents,
  title,
  errorMessage,
  defaultValue,
  onChange,
  className,
  disabled = false,
}: DropdownProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    defaultValue || null
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    register,
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext();

  useEffect(() => {
    setValue(id, selectedSize);
  }, [selectedSize, setValue, id]);

  useEffect(() => {
    if (defaultValue) {
      setSelectedSize(defaultValue);
      setValue(id, defaultValue);
    }
  }, [defaultValue, setValue, id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (content: string) => {
    setSelectedSize(content);
    setIsOpen(false);
    clearErrors(id);
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <>
      <div className="relative w-full min-w-[9rem]" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            if (typeof contents !== "string") setIsOpen(!isOpen);
          }}
          className={cn(
            "py-2 px-4 w-full inline-flex items-center justify-between gap-x-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none",
            className,
            errors[id] &&
              typeof contents !== "string" &&
              "border-red-500 focus:border-red-500 focus:ring-red-500 caret-red-600"
          )}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Dropdown"
          disabled={disabled}
        >
          <p
            className={`text-B2 truncate ${
              selectedSize ? "text-neutral-1000" : "text-neutral-600"
            }`}
          >
            {selectedSize || title}
          </p>
          <svg
            className={`transition-transform ${
              isOpen ? "rotate-180" : ""
            } size-4`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div
            className="absolute z-50 mt-2 w-full bg-white shadow-md rounded-lg p-1 space-y-0.5"
            role="menu"
            aria-orientation="vertical"
          >
            {typeof contents === "string" ? (
              contents
            ) : (
              <>
                {" "}
                {contents.map((content, index) => (
                  <p
                    key={index}
                    className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    onClick={() => handleSelect(content)}
                  >
                    {content}
                  </p>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {typeof contents !== "string" && (
        <input
          type="hidden"
          {...register(id, {
            required: `${title} is required`,
          })}
          value={selectedSize || ""}
        />
      )}

      {errors[id] && typeof contents !== "string" && (
        <p className="text-red-500" style={{ marginTop: 4 }}>
          {errorMessage}
        </p>
      )}
    </>
  );
};

export default Dropdown2;
