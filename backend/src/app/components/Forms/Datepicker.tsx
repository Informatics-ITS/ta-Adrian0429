import "react-datepicker/dist/react-datepicker.css";

import ReactDatePicker from "react-datepicker";
import {
  Controller,
  get,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

import { useRef } from "react";
import { FiCalendar } from "react-icons/fi";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  id: string;
  label: string | null;
  placeholder?: string;
  validation?: RegisterOptions;
  defaultYear?: number;
  defaultMonth?: number;
  defaultValue?: string;
  format?: string | string[];
  readOnly?: boolean;
  helperText?: string;
  hideError?: boolean;
  containerClassName?: string;
} & React.ComponentProps<typeof ReactDatePicker>;

export default function DatePicker({
  id,
  label,
  placeholder,
  validation,
  defaultYear,
  defaultMonth,
  defaultValue,
  format,
  readOnly = false,
  helperText,
  hideError = false,
  disabled,
  containerClassName,
  ...rest
}: DatePickerProps) {
  const {
    formState: { errors },
    control,
    clearErrors,
  } = useFormContext();
  const error = get(errors, id);
  const withLabel = label !== null;
  const defaultDate = new Date();
  if (defaultYear) defaultDate.setFullYear(defaultYear);
  if (defaultMonth) defaultDate.setMonth(defaultMonth);
  const datePickerRef = useRef<ReactDatePicker | null>(null);
  return (
    <div className="relative">
      {withLabel && <p className="text-S2 mb-3">{label}</p>}
      <Controller
        control={control}
        rules={validation}
        defaultValue={defaultValue}
        name={id}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <div
              onClick={() => datePickerRef.current?.setFocus()}
              className={cn(
                "relative text-mid md:text-base border border-gray-300 rounded-lg",
                error &&
                  "border-red-500 focus:border-red-500 focus:ring-red-500 caret-red-600"
              )}
            >
              <ReactDatePicker
                ref={datePickerRef}
                name={id}
                onChange={onChange}
                onChangeRaw={() => {
                  clearErrors(id);
                }}
                onBlur={onBlur}
                selected={value ? new Date(value) : undefined}
                className="w-full rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 text-base-dark focus:border-none focus:ring-0 focus:outline-none z-50"
                placeholderText={placeholder}
                ariaDescribedBy={id}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                openToDate={value ? new Date(value) : defaultDate}
                dateFormat={format ? format : "dd/MM/yyyy"}
                readOnly={readOnly}
                disabled={disabled}
                {...rest}
              />

              <FiCalendar className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 transform text-lg text-neutral-600" />
            </div>
          </>
        )}
      />
      {helperText && <p className="text-S2">{helperText}</p>}
      {!hideError && error && (
        <p className="text-B2 text-red-600">{error.message?.toString()}</p>
      )}
    </div>
  );
}
