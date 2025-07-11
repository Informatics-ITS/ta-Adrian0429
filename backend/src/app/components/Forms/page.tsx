"use client";

import {FormProvider, useForm} from "react-hook-form";

import SelectInput from "@/app/components/Forms/MultiSelectInput";
import Button from "@/app/components/button/Button";

const options = [
    {value: "1", label: "Satu"},
    {value: "2", label: "Dua"},
    {value: "3", label: "Tiga"},
    {value: "4", label: "Empat"},
    {value: "5", label: "Lima"},
];

export default function FormSandbox() {
    const methods = useForm();

    // const {handleSubmit} = methods;
    //
    // const onSubmit = (data) =>{
    //   console.log(data);
    // }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-200 py-12">
            <div className="flex flex-col">
                <FormProvider {...methods}>
                    <form
                        className="w-[600px] mt-8 flex flex-col gap-4"
                        // onSubmit={handleSubmit(onSubmit)}
                    >

                        {/* Select Input */}
                        <SelectInput
                            id="selectReadOnly"
                            label="Select Input Read Only"
                            placeholder="(Option)"
                            options={options}
                            isSearchable={false}
                            disabled
                        />
                        <SelectInput
                            id="selectInput"
                            label="Select Input"
                            placeholder="(Option)"
                            options={options}
                            isSearchable={false}
                        />
                        <SelectInput
                            id="selectInputWithHelperText"
                            label="Select Input With Helper Text"
                            placeholder="(Option)"
                            helperText="Helper Text"
                            isSearchable={false}
                            options={options}
                        />
                        <SelectInput
                            id="selectInputRequired"
                            label="Select Input Required"
                            placeholder="(Option)"
                            options={options}
                            isSearchable={false}
                            validation={{required: "This field is required"}}
                        />
                        <SelectInput
                            id="selectInputRequiredWithHelperText"
                            label="Select Input Required With Helper Text"
                            placeholder="(Option)"
                            helperText="Helper Text"
                            options={options}
                            isSearchable={false}
                            validation={{required: "This field is required"}}
                        />
                        {/* Searchable SelectInput */}
                        <SelectInput
                            id="multipleSelectInputReadOnly"
                            label="Multiple Select Input Read Only"
                            placeholder="(Option)"
                            options={options}
                            isMulti
                            disabled
                        />

                        <SelectInput
                            id="multipleSelectInput"
                            label="Multiple Select Input"
                            placeholder="(Option)"
                            options={options}
                            isMulti
                        />
                        <SelectInput
                            id="multipleSelectInputWithHelper"
                            label="Multiple Select Input With Helper Text"
                            placeholder="(Option)"
                            options={options}
                            helperText="Helper text"
                            isMulti
                        />
                        <SelectInput
                            id="multipleSelectInputRequired"
                            label="Multiple Select Input Required"
                            placeholder="(Option)"
                            validation={{required: "This field is required"}}
                            options={options}
                            isMulti
                        />
                        <SelectInput
                            id="multipleSelectInputRequiredWithHelper"
                            label="Multiple Select Input Required With Helper"
                            placeholder="(Option)"
                            validation={{required: "This field is required"}}
                            options={options}
                            helperText="Helper text"
                            isMulti
                        />
                        <SelectInput
                            id="singleSelectInputWithDefault"
                            label="Single Select Input"
                            placeholder="(Option)"
                            validation={{required: "This field is required"}}
                            options={options}
                            defaultValue="2"
                        />

                        <SelectInput
                            id="multipleSelectInputWithDefault"
                            label="Multiple Select Input"
                            placeholder="(Option)"
                            validation={{required: "This field is required"}}
                            options={options}
                            helperText="Helper text"
                            isMulti
                            defaultValue={["1", "3"]}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </FormProvider>
            </div>
        </main>
    );
}
