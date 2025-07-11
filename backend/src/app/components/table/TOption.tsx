import * as React from "react";
import Select from "react-select";

type option = {
  value: number | string;
  label: string;
};

type TOptionProps = {
  children?: React.ReactNode;
  placeholder?: string;
  value: string | number | readonly string[] | undefined;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  title?: string;
  options: option[];
};

export default function TOption({
  placeholder,
  onChange,
  value,
  title,
  options,
}: TOptionProps) {
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  const handleSelectChange = (newValue: any) => {
    onChange(newValue.value);
  };
  return (
    <div className="w-full md:w-auto z-50">
      <p className="font-bold">{title}</p>
      <Select
        options={options}
        onChange={handleSelectChange}
        placeholder={placeholder}
        value={selectedOption}
        defaultValue={options[0]}
        isSearchable={false}
        className={"mt-1 w-36"}
        styles={{
          indicatorSeparator: () => ({}),
          dropdownIndicator: (baseStyles, state) => ({
            ...baseStyles,
            color: "#808080",
            rotate: state.isFocused ? "180deg" : "0deg",
            transition: "ease-in-out 0.2s",
            "&:hover": {
              color: "#808080",
            },
          }),
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: "#808080",
            paddingTop: "2px",
            paddingBottom: "2px",
            borderRadius: "8px",
            boxShadow: state.isFocused ? "0 0 0 1.5px #000000" : "none",
            "&:hover": {
              borderColor: "#808080",
            },
            color: "#212122",
          }),
          option: (style, state) => ({
            ...style,
            backgroundColor: state.isSelected ? "#F38449" : "white",
            "&:hover": {
              cursor: "pointer",
              backgroundColor: state.isSelected ? "#F38449" : "#E5E5E6",
            },
          }),
        }}
      />
    </div>
  );
}
