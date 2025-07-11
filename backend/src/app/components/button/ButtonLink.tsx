import * as React from "react";
import { IconType } from "react-icons";

import UnstyledLink, { UnstyledLinkProps } from "../Link/UnstyledLink";
import { cn } from "@/lib/utils";

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
type ButtonLinkProps = {
  size?: keyof typeof ButtonSize;
  variant?: keyof typeof ButtonVariant;
  icon?: IconType;
  iconClassName?: string;
  rightIcon?: React.ElementType & IconType;
  rightIconClassName?: string;
  leftIcon?: React.ElementType & IconType;
  leftIconClassName?: string;
  textClassName?: string;
  isShadow?: boolean;
} & UnstyledLinkProps;

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      children,
      className,
      size = "md",
      variant = "primary",
      icon: Icon,
      rightIcon: RightIcon,
      leftIcon: LeftIcon,
      iconClassName,
      rightIconClassName,
      textClassName,
      isShadow,
      ...rest
    },
    ref
  ) => {
    return (
      <UnstyledLink
        ref={ref}
        style={{
          boxShadow: isShadow ? "3px 3px #959698" : "none",
        }}
        className={cn(
          "flex items-center justify-center rounded-lg shadow-sm group",
          "focus:outline-none focus-visible:outline",
          "font-medium transition-colors duration-75",
          "disabled:cursor-not-allowed",
          //#region  //*=========== Size ===========
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
          //#endregion  //*======== Size ===========
          //#region  //*=========== Variants ===========
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
          className
        )}
        {...rest}
      >
        {Icon && (
          <div className="mr-2">
            <Icon className={cn("text-2xl font-semibold", iconClassName)} />
          </div>
        )}
        <span className={textClassName}>{children}</span>
        {RightIcon && (
          <div className="ml-2">
            <RightIcon
              className={cn("text-2xl font-semibold", rightIconClassName)}
            />
          </div>
        )}
      </UnstyledLink>
    );
  }
);

ButtonLink.displayName = "ButtonLink";

export default ButtonLink;
