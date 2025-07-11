"use client";
import React, {useState} from "react";
import Dropdown from "@/app/components/Dropdown";
import withAuth from "@/app/components/hoc/withAuth";
import {useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import Button from "@/app/components/button/Button";
import ButtonLink from "@/app/components/button/ButtonLink";
import {HiPlus} from "react-icons/hi";
import Table from "@/app/components/table/Table";
import {ColumnDef, PaginationState} from "@tanstack/react-table";
import Loading from "@/app/components/Loading";
import TOption from "@/app/components/table/TOption";

type Kategori = {
    id: number;
    nama_jenis: string;
};

export type SearchForm = {
    query: string;
};

type StokResponse = {
    id: number;
    nama_produk: string;
    barcode_id: string;
    harga_jual: number;
    merk: string;
    jenis: string;
    cv: string;
    details: {
        detail_id: number;
        ukuran: string;
        tanggal_restok: string;
        warna_produk: string;
        stok: number;
    }[];
};

export default withAuth(Stok, "kasirstok");

function Stok() {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // GET CATEGORY LIST
    const {data: category, isLoading} = useQuery({
        queryKey: ["jenis"],
        queryFn: async () => {
            const response = await api.get("/api/jenis");
            return response;
        },
    });

    const kategoriData = category?.data?.data || [];

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleCategoryClick = (kategori: string) => {
        setSelectedCategories((prev) =>
            prev.includes(kategori)
                ? prev.filter((cat) => cat !== kategori)
                : [...prev, kategori]
        );
    };

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

    // GET TABLE DATA
    const {data, isLoading: produkLoading} = useQuery({
        queryKey: ["stok", pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            const response = await api.get(`/api/produk`, {
                params: {
                    page: pagination.pageIndex + 1, // API typically expects 1-based index
                    per_page: pagination.pageSize,
                },
            });
            return response;
        },
    });

    const stokData = data?.data?.data?.data || [];
    const maxPage = data?.data?.data?.max_page || 1;
    const currentPage = data?.data?.data?.page || 1;
    const totalCount = data?.data?.data?.count || 0;

    const filteredData = selectedCategories.length
        ? stokData?.filter((item: StokResponse) =>
            selectedCategories.includes(item.jenis)
        )
        : stokData;

    const totalProducts = filteredData?.reduce(
        (acc: number, item: StokResponse) => {
            return (
                acc +
                item.details.reduce((sum, detail) => {
                    return sum + detail.stok;
                }, 0)
            );
        },
        0
    );

    const columns: ColumnDef<StokResponse>[] = [
        {
            accessorKey: "barcode_id",
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
            accessorKey: "harga_jual",
            header: "Harga Jual",
            cell: (props) => (
                <span>Rp {(props.getValue() as number).toLocaleString("id-ID")}</span>
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            id: "tanggal_restok",
            header: "Tanggal Restok",
            accessorFn: (row) => row.details,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props.getValue<StokResponse["details"]>().length > 0 ? (
                        props
                            .getValue<StokResponse["details"]>()
                            .map((detail, idx) => (
                                <span key={idx}>{formatDate(detail.tanggal_restok)}</span>
                            ))
                    ) : (
                        <a href="/pending-stok">Pending</a>
                    )}
                </div>
            ),
        },
        {
            id: "ukuran",
            header: "Ukuran",
            accessorFn: (row) => row.details,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props.getValue<StokResponse["details"]>().length > 0 ? (
                        props
                            .getValue<StokResponse["details"]>()
                            .map((detail, idx) => <span key={idx}>{detail.ukuran}</span>)
                    ) : (
                        <a href="/pending-stok">Pending</a>
                    )}
                </div>
            ),
        },
        {
            id: "jumlah",
            header: "Jumlah",
            accessorFn: (row) => row.details,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props.getValue<StokResponse["details"]>().length > 0 ? (
                        props
                            .getValue<StokResponse["details"]>()
                            .map((detail, idx) => <span key={idx}>{detail.stok}</span>)
                    ) : (
                        <a href="/pending-stok">Pending</a>
                    )}
                </div>
            ),
        },
        {
            id: "warna",
            header: "Warna",
            accessorFn: (row) => row.details,
            cell: (props) => (
                <div className="grid gap-y-4">
                    {props.getValue<StokResponse["details"]>().length > 0 ? (
                        props
                            .getValue<StokResponse["details"]>()
                            .map((detail, idx) => (
                                <span key={idx}>{detail.warna_produk}</span>
                            ))
                    ) : (
                        <a href="/pending-stok">Pending</a>
                    )}
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
                        {row.original.details.length > 0 ? (
                            <>
                                <div className="flex flex-col gap-2">
                                    <ButtonLink
                                        href={`/stok/${row.original.id}`}
                                        variant="primary"
                                        className="px-4 py-2"
                                    >
                                        Detail
                                    </ButtonLink>
                                    <ButtonLink
                                        href={`/stok/${row.original.id}/restok`}
                                        variant="warning"
                                        className="px-4 py-2"
                                    >
                                        Restok
                                    </ButtonLink>
                                </div>
                            </>
                        ) : (
                            <Button variant="primary" className="px-4 py-2" disabled>
                                Detail
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: newPage,
        }));
    };

    const handleEntriesChange = (value: number) => {
        setPagination({
            pageIndex: 0, // Reset to first page when changing entries per page
            pageSize: value,
        });
    };

    if (produkLoading) {
        return <Loading/>;
    }

    return (
        <div className={`h-nav p-8 transition-all duration-300`}>
            <h1 className="text-H1">STOK BARANG</h1>

            <div className="w-full hNavTable max-w-full max-h-hNavTable mt-8">
                <div className="flex overflow-x-auto gap-[10px] custom-scrollbar pb-3">
                    {kategoriData?.map((item: Kategori, index: number) => (
                        <div
                            key={index}
                            onClick={() => handleCategoryClick(item.nama_jenis)}
                            className={`whitespace-nowrap px-4 py-2 w-fit rounded-3xl border cursor-pointer ${
                                selectedCategories.includes(item.nama_jenis)
                                    ? "bg-[#FDF0E8] border-[#FDF0E8] text-[#F0661B]"
                                    : ""
                            }`}
                        >
                            <p className="text-S4">{item.nama_jenis}</p>
                        </div>
                    ))}
                </div>

                <Table
                    className="text-black"
                    tableClassName="max-h-[calc(100vh-350px)]"
                    data={filteredData}
                    columns={columns}
                    columnToggle={{
                        enabled: true,
                        title: "Tampilkan",
                    }}
                    isLoading={isLoading}
                    footers={
                        <div className="flex justify-between items-center w-full">
                            {/* <span>Total Item: {totalProducts}</span> */}
                            <span>Total Item: {totalProducts}</span>
                            <div className="flex gap-2 items-center">
                                <Button
                                    onClick={() => handlePageChange(pagination.pageIndex - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </Button>
                                <span>
                  Page {currentPage} of {maxPage}
                </span>
                                <Button
                                    onClick={() => handlePageChange(pagination.pageIndex + 1)}
                                    disabled={currentPage === maxPage}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    }
                    withFilter
                    extras={
                        <div className="flex justify-end items-center mt-5 gap-x-3 ">
                            <Dropdown
                                type="base"
                                sizes={["DD/MM/YYYY", "XX Hari"]}
                                title="Pilih Format Tanggal"
                                onFormatChange={setDateFormat}
                            />
                            <ButtonLink
                                href="/stok/tambah/baru"
                                size="small"
                                className="p-2 h-[38px]"
                                rightIcon={HiPlus}
                                rightIconClassName="font-medium text-sm -ml-2"
                            >
                                Tambah Barang Baru
                            </ButtonLink>
                            <TOption
                                value={pagination.pageSize}
                                onChange={(value) => handleEntriesChange(Number(value))}
                                options={[
                                    {value: 10, label: "10 entries"},
                                    {value: 25, label: "25 entries"},
                                    {value: 50, label: "50 entries"},
                                    {value: 100, label: "100 entries"},
                                ]}
                            />
                        </div>
                    }
                />
            </div>
        </div>
    );
}
