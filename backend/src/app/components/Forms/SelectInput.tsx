import * as React from "react";
import { get, RegisterOptions, useFormContext } from "react-hook-form";
import { FiChevronDown } from "react-icons/fi";

import { cn } from "@/lib/utils";

export type SelectInputProps = {
  id: string;
  label?: string;
  helperText?: string;
  hideError?: boolean;
  validation?: RegisterOptions;
  readOnly?: boolean;
  placeholder?: string;
} & React.ComponentPropsWithoutRef<"select">;

export default function SelectInput({
  id,
  label,
  helperText,
  hideError = false,
  validation,
  className,
  readOnly = false,
  defaultValue = "",
  placeholder = "",
  children,
  ...rest
}: SelectInputProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const error = get(errors, id);
  const value = watch(id);
  const withLabel = label !== null;

  return (
    <div className="w-full h-full rounded-md flex items-center justify-center">
      {withLabel && <h5 className="text-S2 mb-3">{label}</h5>}

      <div className="relative w-full">
        <select
          {...register(id, validation)}
          id={id}
          name={id}
          defaultValue={defaultValue}
          disabled={readOnly}
          className={cn(
            "appearance-none truncate cursor-pointer",
            "hs-dropdown-toggle py-2 px-2 inline-flex items-center gap-x-2 min-w-[70%] text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none",
            readOnly && "cursor-not-allowed",
            error && "ring-1 ring-inset ring-red-500 focus:ring-red-500",
            value && "ring-none",
            className
          )}
          aria-describedby={id}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden className="flex text-center">
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-[10%] flex items-center pr-3">
          <FiChevronDown className="" />
        </div>
      </div>

      {!hideError && error && (
        <h5 className="mt-1 text-red-500">{error.message}</h5>
      )}
      {!error && helperText && (
        <h5 className="mt-1 text-base-secondary">{helperText}</h5>
      )}
    </div>
  );
}
