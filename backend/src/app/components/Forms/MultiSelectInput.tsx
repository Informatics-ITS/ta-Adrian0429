"use client";

import clsx from "clsx";
import * as React from "react";
import {Controller, get, RegisterOptions, useFormContext,} from "react-hook-form";
import {FaCheck, FaChevronDown} from "react-icons/fa6";
import {IoClose} from "react-icons/io5";
import Select, {components, GroupBase, MultiValue, OptionProps, StylesConfig,} from "react-select";
import {ExtractProps} from "@/app/lib/helper";

export type SelectInputProps = {
    label: string | null;
    id: string;
    placeholder?: React.ReactNode;
    helperText?: string;
    type?: string;
    isMulti?: boolean;
    isSearchable?: boolean;
    readOnly?: boolean;
    hideError?: boolean;
    validation?: RegisterOptions;
    options: { value: string; label: string }[];
    defaultValue?: string | string[];
    containerClassName?: string;
} & React.ComponentPropsWithoutRef<"select"> &
    ExtractProps<Select>;

export default function SelectInput({
                                        disabled,
                                        readOnly,
                                        label,
                                        helperText,
                                        id,
                                        isMulti = false,
                                        isSearchable = true,
                                        placeholder,
                                        validation,
                                        options,
                                        hideError = false,
                                        defaultValue,
                                        containerClassName,
                                        ...rest
                                    }: SelectInputProps) {
    const {
        control,
        formState: {errors},
    } = useFormContext();
    const error = get(errors, id);
    const reactId = React.useId();

    const withLabel = label !== null;

    //#region  //*=========== Styles ===========
    const customStyles: StylesConfig = {
        control: (styles, state) => ({
            ...styles,
            border: `1px solid ${error ? "#F23737" : "#d1d5db"}`, // danger-main : gray-300
            borderRadius: "0.375rem",
            padding: isMulti ? "0.25rem 0.75rem" : "0.5rem 0.75rem",
            background: disabled || readOnly ? "#F3F4F6" : "white", // light gray
            cursor: "pointer",
            overflowY: isMulti ? "hidden" : "auto",
            color: "#232323", // typo-main
            margin: "0 auto",
            "&:focus-within": {
                border: `2px solid ${error ? "#F23737" : "#F0661B"}`, // danger-main : brand-600
                boxShadow: "none",
                borderBottomLeftRadius: state.menuIsOpen ? "0" : "0.375rem",
                borderBottomRightRadius: state.menuIsOpen ? "0" : "0.375rem",
                borderBottom: state.menuIsOpen
                    ? "0"
                    : `2px solid ${error ? "#F23737" : "#F0661B"}`,
            },
            "*": {
                boxShadow: "none !important",
            },
        }),
        valueContainer: (styles) => ({
            ...styles,
            padding: 0,
            gap: "0.5rem",
            flexWrap: isMulti ? "nowrap" : "wrap",
        }),
        input: (styles) => ({
            ...styles,
            padding: 0,
            margin: 0,
            caretColor: "#232323", // typo-main
            color: "#232323", // typo-main
            "::placeholder": {
                color: "#111827", // gray-900
            },
        }),
        indicatorsContainer: (styles) => ({
            ...styles,
            color: "#232323", // typo-main
            "&>div": {
                padding: 0,
            },
        }),
        dropdownIndicator: (styles) => ({
            ...styles,
            color: "black",
            "&:hover": {
                color: "#878787", // gray
            },
        }),
        option: (styles, state) => ({
            ...styles,
            color: "#232323", // typo-main
            background: state.isFocused
                ? "#F0661B" // brand-600
                : state.isSelected
                    ? "#F0661B" // brand-600
                    : "white",
            ":hover": {
                background: "#F0661B ", // brand-600
                color: "white"
            },
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #959698", // typo-inline
        }),
        multiValue: (styles) => ({
            ...styles,
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            border: "1px solid #F0661B", // brand-600
            borderRadius: "1rem",
            background: "white",
            padding: "0.25rem 0.75rem",
            margin: 0,
            flexShrink: 3,
        }),
        multiValueLabel: (styles) => ({
            ...styles,
            color: "black",
            padding: 0,
            paddingLeft: 0,
            whiteSpace: "nowrap",
        }),
        multiValueRemove: (styles) => ({
            ...styles,
            color: "black",
            padding: 0,
            paddingLeft: "0.5rem",
            "&:hover": {
                color: "#6b7280", // gray-500
                backgroundColor: "transparent",
            },
        }),
        menu: (styles) => ({
            ...styles,
            overflow: "hidden",
            borderRadius: "0",
            borderBottomLeftRadius: "0.375rem",
            borderBottomRightRadius: "0.375rem",
            padding: "0",
            marginTop: "-1px",
            border: `2px solid ${error ? "#F23737" : "#F0661B"}`,
            borderTop: "none",
            boxShadow: "none",
        }),
        menuList: (styles) => ({
            ...styles,
            padding: "0", // Remove default padding
        }),
    };
    //#endregion  //*======== Styles ===========

    const CustomOption = <
        Option,
        IsMulti extends boolean = false,
        Group extends GroupBase<Option> = GroupBase<Option>,
    >(
        props: OptionProps<Option, IsMulti, Group>,
    ) => {
        const {isSelected} = props;

        return (
            <components.Option {...props}>
                <div>{props.label}</div>
                <div className="ml-2">
                    {isSelected && <FaCheck size={18} className="text-black"/>}
                </div>
            </components.Option>
        );
    };

    return (
        <div className={containerClassName}>
            {withLabel && (
                <h5 className={`text-S2 mb-3`}>{label}</h5>
            )}
            <div
                className={clsx(
                    "relative",
                    withLabel && "mt-1",
                    (disabled || readOnly) && "cursor-not-allowed",
                )}
            >
                <Controller
                    name={id}
                    control={control}
                    rules={validation}
                    defaultValue={defaultValue || (isMulti ? [] : "")}
                    render={({field}) => {
                        return (
                            <Select
                                {...field}
                                value={
                                    //? null is needed so if the selected value is not found in the options, it will clear the value
                                    isMulti
                                        ? field.value?.map(
                                            (value: unknown) =>
                                                options.find((option) => option.value === value) ??
                                                null,
                                        )
                                        : options.find((opt) => opt.value === field.value) ?? null
                                }
                                onChange={(selectedOptions) => {
                                    isMulti
                                        ? field.onChange(
                                            (
                                                selectedOptions as MultiValue<
                                                    (typeof options)[number]
                                                >
                                            ).map((option) => option?.value ?? ""),
                                        )
                                        : field.onChange(
                                            (selectedOptions as (typeof options)[number])?.value ??
                                            "",
                                        );
                                }}
                                isDisabled={disabled}
                                isClearable
                                isMulti={isMulti}
                                isSearchable={isSearchable}
                                closeMenuOnSelect={!isMulti}
                                placeholder={placeholder}
                                options={options}
                                classNames={{
                                    control: () => "!min-h-[2.25rem] md:!min-h-[2.5rem]",
                                }}
                                styles={customStyles}
                                instanceId={reactId}
                                components={{
                                    IndicatorSeparator: () => null,
                                    DropdownIndicator: (props) => (
                                        <components.DropdownIndicator {...props}>
                                            <FaChevronDown size={18}/>
                                        </components.DropdownIndicator>
                                    ),
                                    ClearIndicator: (props) => (
                                        <components.ClearIndicator {...props}>
                                            <IoClose
                                                size={18}
                                                className="mr-0.5 text-typo-icons hover:text-typo-secondary"
                                            />
                                        </components.ClearIndicator>
                                    ),
                                    MultiValueRemove: (props) => (
                                        <components.MultiValueRemove {...props}>
                                            <IoClose size={18}/>
                                        </components.MultiValueRemove>
                                    ),
                                    Option: CustomOption,
                                }}
                                {...rest}
                            />
                        );
                    }}
                />
                {!hideError && error && (
                    <h5 className="mt-1 text-red-500">{error.message?.toString()}</h5>
                )}
                {helperText && (
                    <h5
                        className={`text-typo-outline-1 ${!hideError && error && "text-danger-main"}`}
                    >
                        {helperText}
                    </h5>
                )}
            </div>
        </div>
    );
}
