import * as React from "react";
import { get, RegisterOptions, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

export type TextAreaProps = {
  id: string;
  label?: string;
  helperText?: string;
  hideError?: boolean;
  validation?: RegisterOptions;
  containerClassName?: string;
} & React.ComponentPropsWithoutRef<"textarea">;

export default function TextArea({
  id,
  label,
  helperText,
  hideError = false,
  validation,
  className,
  containerClassName,
  maxLength = 1000,
  readOnly = false,
  ...rest
}: TextAreaProps) {
  const [value, setValue] = React.useState("");

  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, id);
  const textArea = register(id, validation);

  const handleChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    textArea.onChange(e);
    setValue(e.currentTarget.value);
  };

  return (
    <div className={cn("w-full space-y-1.5", containerClassName)}>
      {label && <h5 className="text-S2 mb-3">{label}</h5>}

      <div className="relative">
        <textarea
          {...textArea}
          id={id}
          name={id}
          readOnly={readOnly}
          disabled={readOnly}
          maxLength={maxLength}
          onChange={handleChange}
          className={cn(
            "h-full w-full rounded-lg shadow-sm border border-gray-300 text-base-dark caret-brand-600 py-2 px-3.5 min-h-[240px]",
            "focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600",
            "hover:ring-1 hover:ring-inset hover:ring-[#000]",
            readOnly &&
              "cursor-not-allowed border-gray-300 bg-gray-100 focus:border-gray-300 focus:ring-0",
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500 caret-red-600",
            className
          )}
          aria-describedby={id}
          {...rest}
        />
        <p className="absolute bottom-2.5 right-6 text-xs">
          {value.length}/{maxLength}
        </p>
      </div>
      {helperText && <h5 className="mt-1 text-base-secondary">{helperText}</h5>}
      {!hideError && error && (
        <h5 className="text-red-500" style={{ marginTop: 4 }}>
          {error.message?.toString()}
        </h5>
      )}
    </div>
  );
}
