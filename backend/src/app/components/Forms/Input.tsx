"use client";
import * as React from "react";
import { get, RegisterOptions, useFormContext } from "react-hook-form";
import { IconType } from "react-icons";
import { HiEye, HiEyeOff } from "react-icons/hi";

import clsxm from "@/app/lib/clsxm";

export type InputProps = {
  label: string | null;
  id: string;
  placeholder?: string;
  helperText?: string;
  type?: React.HTMLInputTypeAttribute;
  readOnly?: boolean;
  hideError?: boolean;
  validation?: RegisterOptions;
  leftIcon?: IconType | string;
  inputWithLeftIconClassName?: string;
  rightNode?: React.ReactNode;
  addon?: string;
  containerClassName?: string;
  formatNumber?: boolean;
} & React.ComponentPropsWithoutRef<"input">;

export default function Input({
  label,
  id,
  placeholder = "",
  helperText,
  type = "text",
  disabled,
  readOnly = false,
  hideError = false,
  validation,
  leftIcon: LeftIcon,
  inputWithLeftIconClassName,
  addon,
  rightNode,
  containerClassName,
  formatNumber = false,
  ...rest
}: InputProps) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const error = get(errors, id);
  const withLabel = label !== null;

  const [showPassword, setShowPassword] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState("");
  const togglePassword = () => setShowPassword((prev) => !prev);

  const formatNumberWithDot = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    if (!numericValue) return "";

    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(numericValue, 10));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formatNumber && type === "number") {
      const rawValue = e.target.value;
      const cleanedValue = rawValue.replace(/\./g, "");
      const numericValue = cleanedValue.replace(/[^0-9]/g, "");
      const formattedValue = formatNumberWithDot(numericValue);

      setDisplayValue(formattedValue);

      const numeric = numericValue ? parseInt(numericValue, 10) : null;

      if (numeric !== null) {
        setValue(id, numeric, { shouldValidate: true });
      }
    } else {
      setDisplayValue(e.target.value);
    }
  };

  return (
    <div className={containerClassName}>
      {withLabel && <h5 className="text-S2 mb-3">{label}</h5>}
      <div
        className={clsxm(
          "relative",
          withLabel && "mt-1",
          addon && "flex shadow-sm rounded-lg",
          "text-mid md:text-mid"
        )}
      >
        {addon && (
          <div
            className={clsxm(
              "pointer-events-auto min-h-full flex items-center px-3.5 rounded-l-lg",
              "bg-base-lightgray text-base-secondary",
              "border border-gray-300 border-r-0"
            )}
          >
            <h5 className="text-B2">{addon}</h5>
          </div>
        )}
        {LeftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            {typeof LeftIcon === "string" ? (
              <h5 className="text-base-black">{LeftIcon}</h5>
            ) : (
              <LeftIcon size="1em" className="text-xl text-base-secondary" />
            )}
          </div>
        )}
        <input
          {...register(id, validation)}
          type={
            formatNumber
              ? "text"
              : type === "password"
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          name={id}
          id={id}
          {...(formatNumber
            ? {
                value: displayValue,
                onChange: (e) => {
                  rest.onChange?.(e);
                  handleInputChange(e);
                },
              }
            : {})}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className={clsxm(
            "flex w-full rounded-lg shadow-sm",
            "min-h-[2.25rem] md:min-h-[2.5rem]",
            "px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600",
            "focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600",
            (readOnly || disabled) && [
              "cursor-not-allowed border-gray-300 bg-gray-100 focus:border-gray-300 focus:ring-0",
            ],
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500 caret-red-600",
            LeftIcon && ["pl-10", inputWithLeftIconClassName],
            rightNode && "pr-10",
            addon && "rounded-l-none shadow-none"
          )}
          aria-describedby={id}
          {...rest}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={togglePassword}
            className={clsxm(
              "absolute top-1/2 right-0 -translate-y-1/2 mr-3",
              "flex justify-center items-center rounded-md w-6 h-6",
              "focus:outline-none focus:ring focus:ring-brand-600",
              "text-base-icon hover:text-base-secondary text-[1.175rem]"
            )}
          >
            {showPassword ? <HiEyeOff /> : <HiEye />}
          </button>
        )}
        {rightNode && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightNode}
          </div>
        )}
      </div>
      {helperText && <h5 className="mt-1 text-base-secondary">{helperText}</h5>}
      {!hideError && error && (
        <h5 className="mt-1 text-red-500">{error.message?.toString()}</h5>
      )}
    </div>
  );
}
