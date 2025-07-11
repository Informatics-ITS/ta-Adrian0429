import { LucideIcon } from "lucide-react";
import * as React from "react";
import { IconType } from "react-icons";
import { CgSpinner } from "react-icons/cg";

import clsxm from "@/app/lib/clsxm";

export enum ButtonVariant {
  "primary",
  "outline primary",
  "success",
  "outline success",
  "danger",
  "outline danger",
  "warning",
  "outline warning",
  "outline",
  "ghost",
  "unstyled",
}

enum ButtonSize {
  "icon",
  "small",
  "base",
  "large",
}

export type ButtonProps = {
  size?: keyof typeof ButtonSize;
  variant?: keyof typeof ButtonVariant;
  isLoading?: boolean;
  icon?: IconType | LucideIcon;
  leftIcon?: IconType | LucideIcon;
  rightIcon?: IconType;
  iconClassName?: string;
  leftIconClassName?: string;
  rightIconClassName?: string;
  textClassName?: string;
} & React.ComponentPropsWithRef<"button">;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled: buttonDisabled,
      isLoading,
      size = "base",
      variant = "primary",
      icon: Icon,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      iconClassName,
      leftIconClassName,
      rightIconClassName,
      textClassName,
      ...rest
    },
    ref
  ) => {
    const disabled = isLoading || buttonDisabled;
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={clsxm(
          "flex items-center justify-center rounded-lg shadow-sm group",
          "focus:outline-none focus-visible:outline",
          "font-medium transition-colors duration-75",
          "disabled:cursor-not-allowed",
          [
            size === "icon" && ["w-10 h-10 text-sm p-0 shadow-none"],
            size === "small" && [
              "min-h-[1.75rem] md:min-h-[2rem]",
              "gap-1.5 px-3.5 py-1 text-S3 md:text-sm",
              LeftIcon && "pl-2.5",
              RightIcon && "pr-2.5",
              Icon && "min-w-[1.75rem] p-0 text-sm md:min-w-[2rem] md:text-mid",
            ],
            size === "base" && [
              "min-h-[2.25rem] md:min-h-[2.5rem]",
              "gap-2 px-4 py-1.5 text-H5 md:text-S2",
              LeftIcon && "pl-3",
              RightIcon && "pr-3",
              Icon &&
                "min-w-[2.25rem] p-0 text-base md:min-w-[2.5rem] md:text-lg",
            ],
            size === "large" && [
              "min-h-[2.75rem] md:min-h-[3rem]",
              "gap-2.5 px-[1.125rem] py-2 !text-H5 md:!text-H5",
              LeftIcon && "pl-3.5",
              RightIcon && "pr-3.5",
              Icon &&
                "min-w-[2.75rem] p-0 text-[19px] md:min-w-[3rem] md:text-[22px]",
            ],
          ],
          [
            variant === "primary" && [
              "bg-brand-600 text-white",
              "border border-brand-600",
              "hover:bg-brand-700 hover:border-brand-700",
              "active:bg-brand-800 active:border-brand-800",
              "disabled:bg-brand-800 disabled:border-brand-800",
              "focus:ring focus:ring-brand-300/60",
            ],
            variant === "outline primary" && [
              "text-brand-600",
              "border-2 border-brand-600",
              "hover:border-brand-700",
              "active:bg-brand-600 active:border-brand-600 active:text-white",
              "disabled:bg-brand-800 disabled:border-brand-800",
              "focus:ring focus:ring-brand-300/60",
            ],
            variant === "success" && [
              "bg-success-600 text-white",
              // "border border-success-100",
              "hover:bg-success-700",
              "active:bg-success-600 active:border-success-200",
              "disabled:bg-success-200 disabled:border-success-200",
              "focus:ring focus:ring-success-300/60",
            ],
            variant === "outline success" && [
              "text-success-600",
              "border-2 border-success-600",
              "hover:border-success-700",
              "active:bg-success-600 active:border-success-600 active:text-white",
              "disabled:bg-success-800 disabled:border-success-800",
              "focus:ring focus:ring-success-300/60",
            ],
            variant === "outline" && [
              "text-neutral-900",
              "border border-neutral-500",
              "hover:bg-base-white focus-visible:outline-base-light active:bg-base-light disabled:bg-base-light",
            ],
            variant === "danger" && [
              "bg-danger-600 text-white",
              "border border-danger-600",
              "hover:bg-danger-700 hover:border-danger-700",
              "active:bg-danger-800 active:border-danger-800",
              "disabled:bg-danger-800 disabled:border-danger-800",
              "focus:ring focus:ring-danger-300/60",
            ],
            variant === "outline danger" && [
              "text-danger-600",
              "border-2 border-danger-600",
              "hover:border-danger-700",
              "active:bg-danger-600 active:border-danger-600 active:text-white",
              "disabled:bg-danger-800 disabled:border-danger-800",
              "focus:ring focus:ring-danger-300/60",
            ],
            variant === "warning" && [
              "bg-warning-600 text-white",
              "border border-warning-600",
              "hover:bg-warning-700 hover:border-warning-700",
              "active:bg-warning-800 active:border-warning-800",
              "disabled:bg-warning-800 disabled:border-warning-800",
              "focus:ring focus:ring-warning-300/60",
            ],
            variant === "outline warning" && [
              "text-warning-600",
              "border-2 border-warning-600",
              "hover:border-warning-700",
              "active:bg-warning-600 active:border-warning-600 active:text-white",
              "disabled:bg-warning-800 disabled:border-warning-800",
              "focus:ring focus:ring-warning-300/60",
            ],
            variant === "ghost" && [
              "hover:bg-blue-50 text-blue-600",
              "bg-transparent shadow-none",
              "focus:ring focus:ring-blue-600",
              "disabled:bg-blue-50",
            ],
          ],
          isLoading &&
            "relative text-transparent transition-none hover:text-transparent disabled:cursor-wait",
          className
        )}
        {...rest}
      >
        {isLoading && (
          <div
            className={clsxm(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white",
              variant === "outline" && "text-gray-700",
              variant === "success" && "text-white",
              variant === "ghost" && "text-blue-600"
            )}
          >
            <CgSpinner className="animate-spin" />
          </div>
        )}
        {Icon && <Icon className={clsxm(iconClassName)} />}
        {LeftIcon && !Icon && <LeftIcon className={clsxm(leftIconClassName)} />}
        {!Icon && <div className={clsxm(textClassName)}>{children}</div>}
        {RightIcon && !Icon && (
          <RightIcon className={clsxm(rightIconClassName)} />
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
