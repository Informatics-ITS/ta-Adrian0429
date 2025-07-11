import api from "@/lib/api";
import {useQuery} from "@tanstack/react-query";
import React, {useState} from "react";
import {PendingStok} from "./page";
import ButtonLink from "@/app/components/button/ButtonLink";
import {ColumnDef} from "@tanstack/react-table";
import Table from "@/app/components/table/Table";
import Dropdown from "@/app/components/Dropdown";
import Loading from "@/app/components/Loading";

interface PendingStokProps {
    filteredData: PendingStok[];
    totalProducts: number;
    isLoading: boolean;
}

export type HistoryRestok = {
    id: number;
    nama_produk: string;
    merk: string;
    supplier_name: string;
    tanggal_restok: string;
    detail_restok: HistoryRestokDetail[];
};

export type HistoryRestokDetail = {
    ukuran: string;
    warna: string;
    jumlah: number;
};

type ActivePendingStok = {
    restok_id: number;
    barcode: string;
    nama_produk: string;
    merk: string;
    jenis: string;
    cv: string;
    stoks: {
        ukuran: string;
        tanggal_restok: string;
        warna: string;
        stok: number;
    }[];
};

type HistoryPendingStok = {
    id: number;
    nama_produk: string;
    merk: string;
    supplier_name: string;
    tanggal_restok: string;
    detail_restok: { ukuran: string; warna: string; jumlah: number }[];
};

function formatISODate(date: Date): string {
    return date.toISOString().split("T")[0];
}

export default function PendingStokTabs({
                                            filteredData,
                                            totalProducts,
                                            isLoading,
                                        }: PendingStokProps) {
    const now = new Date();
    now.setHours(new Date().getHours() + 7);

    const [filterStartDate, setFilterStartDate] = useState(formatISODate(now));
    const [filterEndDate, setFilterEndDate] = useState(formatISODate(now));

    const [isCurrentTab, setisCurrentTab] = useState(true);
    const [isHistoryTab, setisHistoryTab] = useState(false);

    const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        const today = new Date();

        if (dateFormat === "XX Hari") {
            const diffTime = Math.abs(today.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `${diffDays} hari`;
        } else {
            // Default DD/MM/YYYY format
            return date
                .toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                .replace(/\//g, "/");
        }
    };

    // GET HISTORY RESTOK DATA
    const {data: historyRestok, isLoading: historyRestokLoading} = useQuery({
        queryKey: ["history-restok", filterStartDate, filterEndDate],
        queryFn: async () => {
            let start_date = formatISODate(now);
            let end_date = formatISODate(now);

            if (filterStartDate && filterEndDate) {
                start_date = filterStartDate;
                end_date = filterEndDate;
            }

            const response = await api.get(`/api/produk/restok-history`, {
                params: {
                    start_date,
                    end_date,
                },
            });
            return response.data.data;
        },
    });

    const historyRestokData = Array.isArray(historyRestok) ? historyRestok : [];

    const totalHistoryProducts = historyRestokData?.reduce(
        (acc: number, item: HistoryRestok) => {
            return (
                acc + item.detail_restok.reduce((sum, detail) => sum + detail.jumlah, 0)
            );
        },
        0
    );

    const ActivePendingStokColumns: ColumnDef<ActivePendingStok>[] = [
        {
            accessorKey: "barcode",
            header: "Barcode",
            cell: (props) => <span>{props.getValue() as string}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "nama_produk",
            header: "Nama Produk",
            cell: (props) => <span>{props.getValue() as string}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "merk",
            header: "Merk Barang",
            cell: (props) => <span>{props.getValue() as string}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "jenis",
            header: "Kategori",
            cell: (props) => <span>{props.getValue() as string}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "cv",
            header: "CV",
            cell: (props) => <span>{props.getValue() as string}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            id: "tanggal_restok",
            header: "Tanggal Restok",
            accessorFn: (row) => row.stoks,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props.getValue<ActivePendingStok["stoks"]>().map((detail, idx) => (
                        <span key={idx}>{formatDate(detail.tanggal_restok)}</span>
                    ))}
                </div>
            ),
        },
        {
            id: "ukuran",
            header: "Ukuran",
            accessorFn: (row) => row.stoks,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props.getValue<ActivePendingStok["stoks"]>().map((detail, idx) => (
                        <span key={idx}>{detail.ukuran}</span>
                    ))}
                </div>
            ),
        },
        {
            id: "stok",
            header: "Jumlah",
            accessorFn: (row) => row.stoks,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props.getValue<ActivePendingStok["stoks"]>().map((detail, idx) => (
                        <span key={idx}>{detail.stok}</span>
                    ))}
                </div>
            ),
        },
        {
            id: "warna",
            header: "Warna",
            accessorFn: (row) => row.stoks,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props.getValue<ActivePendingStok["stoks"]>().map((detail, idx) => (
                        <span key={idx}>{detail.warna}</span>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: "actions",
            header: "",
            enableHiding: false,
            cell: ({row}) => {
                return (
                    <div className="h-full flex items-center grid-cols-1 justify-center">
                        <ButtonLink
                            href={`/pending-stok/${row.original.restok_id}`}
                            variant="primary"
                            size="small"
                            className="px-4 py-2"
                        >
                            Lihat
                        </ButtonLink>
                    </div>
                );
            },
        },
    ];

    const HistoryRestokColumns: ColumnDef<HistoryPendingStok>[] = [
        {
            accessorKey: "id",
            header: "Restok ID",
            cell: (props) => <span>{props.getValue() as string}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "nama_produk",
            header: "Nama Produk",
            cell: (props) => <span>{props.getValue() as string}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "merk",
            header: "Merk Barang",
            cell: (props) => <span>{props.getValue() as string}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "tanggal_restok",
            header: "Tanggal Restok",
            cell: (props) => <span>{formatDate(props.getValue() as string)}</span>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },

        {
            id: "ukuran",
            header: "Ukuran",
            accessorFn: (row) => row.detail_restok,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props
                        .getValue<HistoryPendingStok["detail_restok"]>()
                        .map((detail, idx) => (
                            <span key={idx}>{detail.ukuran}</span>
                        ))}
                </div>
            ),
        },
        {
            id: "jumlah",
            header: "Jumlah",
            accessorFn: (row) => row.detail_restok,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props
                        .getValue<HistoryPendingStok["detail_restok"]>()
                        .map((detail, idx) => (
                            <span key={idx}>{detail.jumlah}</span>
                        ))}
                </div>
            ),
        },
        {
            id: "warna",
            header: "Warna",
            accessorFn: (row) => row.detail_restok,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props
                        .getValue<HistoryPendingStok["detail_restok"]>()
                        .map((detail, idx) => (
                            <span key={idx}>{detail.warna}</span>
                        ))}
                </div>
            ),
        },
    ];

    if (historyRestokLoading || isLoading) {
        return <Loading/>;
    }

    return (
        <>
            <div className="border-b border-gray-200">
                <nav
                    className="-mb-0.5 flex justify-center space-x-6"
                    aria-label="Tabs"
                    role="tablist"
                >
                    <button
                        type="button"
                        className={`hs-tab-active:font-semibold w-full hs-tab-active:border-brand-600 hs-tab-active:text-brand-600 py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none ${
                            isCurrentTab && "active"
                        }`}
                        id="horizontal-alignment-item-1"
                        data-hs-tab="#horizontal-alignment-1"
                        aria-controls="horizontal-alignment-1"
                        role="tab"
                        onClick={() => {
                            setisCurrentTab(true);
                            setisHistoryTab(false);
                        }}
                    >
                        Active Pending Stok
                    </button>
                    <button
                        type="button"
                        className={`hs-tab-active:font-semibold w-full hs-tab-active:border-brand-600 hs-tab-active:text-brand-600 py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none ${
                            isHistoryTab && "active"
                        }`}
                        id="horizontal-alignment-item-2"
                        data-hs-tab="#horizontal-alignment-2"
                        aria-controls="horizontal-alignment-2"
                        role="tab"
                        onClick={() => {
                            setisCurrentTab(false);
                            setisHistoryTab(true);
                        }}
                    >
                        History Restok
                    </button>
                </nav>
            </div>

            <div className="mt-8">
                <div
                    id="horizontal-alignment-1"
                    role="tabpanel"
                    aria-labelledby="horizontal-alignment-item-1"
                    className={isCurrentTab ? "" : "hidden"}
                >
                    <Table
                        className="text-black"
                        tableClassName="h-full max-h-[calc(100vh-440px)]"
                        data={filteredData}
                        columns={ActivePendingStokColumns}
                        columnToggle={{
                            enabled: true,
                            title: "Tampilkan",
                            className: "overflow-y-auto max-h-[350px]",
                        }}
                        isLoading={isLoading}
                        footers={<>Total Item: {totalProducts}</>}
                        withFilter
                        extras={
                            <div className="flex justify-end items-center mt-5 gap-x-3 ">
                                <Dropdown
                                    type="base"
                                    sizes={["DD/MM/YYYY", "XX Hari"]}
                                    title="Pilih Format Tanggal"
                                    onFormatChange={setDateFormat}
                                />
                            </div>
                        }
                    />
                </div>
                <div
                    id="horizontal-alignment-2"
                    role="tabpanel"
                    aria-labelledby="horizontal-alignment-item-2"
                    className={isHistoryTab ? "" : "hidden"}
                >
                    <div className="table-section pb-4">
                        <Table
                            className="text-black"
                            tableClassName="max-h-[calc(100vh-440px)] h-full"
                            data={historyRestokData}
                            columns={HistoryRestokColumns}
                            columnToggle={{
                                enabled: true,
                                title: "Tampilkan",
                                className: "overflow-y-auto max-h-[350px]",
                            }}
                            isLoading={historyRestokLoading}
                            footers={<>Total Item: {totalHistoryProducts}</>}
                            withFilter
                            extras={
                                <div className="flex justify-end items-center mt-5 gap-x-3 ">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                            className="flex w-fit rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600"
                                        />
                                        <span className="">-</span>
                                        <input
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                            className="flex w-fit rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600"
                                        />
                                    </div>
                                    <Dropdown
                                        type="base"
                                        sizes={["DD/MM/YYYY", "XX Hari"]}
                                        title="Pilih Format Tanggal"
                                        onFormatChange={setDateFormat}
                                    />
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
