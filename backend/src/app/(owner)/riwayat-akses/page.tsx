"use client";
import Button from "@/app/components/button/Button";
import React, {useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {FiDownload} from "react-icons/fi";
import {format} from "date-fns";
import DatePicker from "@/app/components/Forms/Datepicker";
import withAuth from "@/app/components/hoc/withAuth";
import {useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {ColumnDef} from "@tanstack/react-table";
import Table from "@/app/components/table/Table";

export type FilterHistory = {
    query: string;
    startDate: Date;
    endDate: Date;
    sortOptions: string;
};

type AccessLogData = {
    id: number;
    name: string;
    email: string;
    ip_address: string;
    activity: string;
    token: string;
    payload: string;
    created_at: string;
};

const formatDateTime = (utcDateStr: string): string => {
    const utcDate = new Date(utcDateStr);
    return format(utcDate, "MM/dd/yyyy, HH:mm:ss");
};

export default withAuth(Riwayat, "admin");

function Riwayat() {
    const methods = useForm<FilterHistory>({
        mode: "onChange",
        defaultValues: {
            startDate: new Date(),
            endDate: new Date(),
        },
    });

    const [currentPage, setCurrentPage] = useState(1);

    const {data, refetch, isLoading} = useQuery({
        queryKey: ["log", currentPage],
        queryFn: async () => {
            const response = await api.get(`/api/log?page=${currentPage}`);
            return response;
        },
    });

    const logData = data?.data.data.data;

    const searchQuery = methods.watch("query");
    const startDate = methods.watch("startDate");
    const endDate = methods.watch("endDate");

    const stripTime = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    };

    const endOfDay = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        return newDate;
    };

    const filteredLogData = (logData || []).filter((logData: AccessLogData) => {
        const logDate = new Date(logData.created_at);
        const startDateStripped = startDate ? stripTime(startDate) : null;
        const endDateAdjusted = endDate ? endOfDay(endDate) : null;

        const withinDateRange =
            (!startDateStripped || logDate >= startDateStripped) &&
            (!endDateAdjusted || logDate <= endDateAdjusted);

        const matchesSearchQuery = logData.name
            .toLowerCase()
            .includes(searchQuery?.toLowerCase() || "");

        return withinDateRange && matchesSearchQuery;
    });

    const downloadQuery = useQuery({
        queryKey: ["download"],
        queryFn: async () => {
            const response = await api.get("/api/log/download", {
                responseType: "blob",
            });
            return response.data;
        },
        enabled: false,
    });

    const {refetch: refetchDownload, isFetching} = downloadQuery;

    const handleDownload = async () => {
        try {
            const fileData = await refetchDownload();

            const blob = new Blob([fileData.data], {type: fileData.data.type});
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "Data Riwayat Akses.xlsx";
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast.success("Data berhasil diunduh!");
        } catch (error) {
            toast.error("Gagal mengunduh data");
        }
    };

    const columns: ColumnDef<AccessLogData>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: (props: any) => <span>{`${props.getValue()}`}</span>,
        },
        {
            accessorKey: "name",
            header: "Nama Karyawan",
            cell: (props: any) => <span>{`${props.getValue()}`}</span>,
            filterFn: (row: any, id: any, value: any) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: (props: any) => <span>{`${props.getValue()}`}</span>,
            filterFn: (row: any, id: any, value: any) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "ip_address",
            header: "IP Address",
            cell: (props: any) => <span>{`${props.getValue()}`}</span>,
        },
        {
            accessorKey: "activity",
            header: "Activity",
            cell: (props: any) => <span>{`${props.getValue()}`}</span>,
        },
        {
            accessorKey: "token",
            header: "Token",
            cell: (props: any) => <span>{`${props.getValue()}`}</span>,
        },
        {
            accessorKey: "payload",
            header: "Payload",
            cell: (props: any) => <span>{`${props.getValue()}`}</span>,
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: (props: any) => (
                <span>{formatDateTime(props.getValue() as string)}</span>
            ),
            filterFn: (row: any, id: any, value: any) => {
                return value.includes(row.getValue(id));
            },
        },
    ];

    if (isLoading) {
        return <div>Loading</div>;
    }

    return (
        <div className="h-full px-8 py-4 w-full">
            <h1 className="text-H1">RIWAYAT AKSES</h1>
            <Table
                className="text-black mt-8"
                tableClassName="max-h-[calc(100vh-290px)]"
                data={filteredLogData}
                columns={columns}
                columnToggle={{
                    enabled: true,
                    title: "Tampilkan",
                }}
                withEntries
                isLoading={isLoading}
                footers={<>Jumlah Akses: {filteredLogData.length}</>}
                extras={
                    <div className="flex flex-row justify-end items-center space-x-4 w-full">
                        <div>
                            <FormProvider {...methods}>
                                <div className="flex gap-2 w-full items-center">
                                    <DatePicker
                                        id="startDate"
                                        label={null}
                                        placeholder="Pilih Tanggal Awal"
                                        format="dd-MM-yyyy"
                                        validation={{
                                            valueAsDate: true,
                                        }}
                                    />
                                    <span className="">-</span>
                                    <DatePicker
                                        id="endDate"
                                        label={null}
                                        placeholder="Pilih Tanggal Akhir"
                                        format="dd-MM-yyyy"
                                        validation={{
                                            valueAsDate: true,
                                        }}
                                    />
                                </div>
                            </FormProvider>
                        </div>
                        <Button
                            size="base"
                            variant="outline"
                            leftIcon={FiDownload}
                            onClick={handleDownload}
                            disabled={isFetching}
                            className="border-gray-300 w-[40%] truncate max-w-[150px]"
                        >
                            {isFetching ? "Mengunduh..." : "Unduh Data"}
                        </Button>
                    </div>
                }
                withFilter
            />
        </div>
    );
}
