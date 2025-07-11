"use client";

import React from "react";
import {ColumnDef, VisibilityState} from "@tanstack/react-table";
import withAuth from "@/app/components/hoc/withAuth";
import {useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import Table from "@/app/components/table/Table";

type DetailType = {
    ukuran: string;
    stok: number;
    harga_jual: number;
    total_notional: number;
};

type ProdukType = {
    produk: string;
    detail: DetailType[];
};

type JenisType = {
    jenis: string;
    produk: ProdukType[] | null;
};

type MerkType = {
    merk: string;
    jenis: JenisType[];
};

type DetailJenisType = {
    jumlah: number;
    harga_jual: number;
    total_notional: number;
};

type UkuranJenisType = {
    ukuran: string;
    detail: DetailJenisType[];
};

type JenisResponseType = {
    jenis: string;
    ukuran: UkuranJenisType[];
};

type MerkJenisType = {
    merk: string;
    jenis: JenisResponseType[] | null;
};

type TableDataType = {
    merk: string;
    jenis: string;
    produk: string;
    detail: DetailType[];
};

type MerkResponseType = {
    merk: string;
    total_stok: number;
    total_notional: number;
};

const transformData = (
    data: MerkType[] | MerkJenisType[] | MerkResponseType[],
    filterLevel: string
) => {
    const flatData: any[] = [];

    if (filterLevel === "produk") {
        (data as MerkType[]).forEach((merkItem) => {
            const validJenis = merkItem.jenis.filter((j) => j.produk !== null);

            validJenis.forEach((jenisItem) => {
                if (jenisItem.produk) {
                    jenisItem.produk.forEach((produkItem) => {
                        flatData.push({
                            merk: merkItem.merk,
                            jenis: jenisItem.jenis,
                            produk: produkItem.produk,
                            detail: produkItem.detail.map((d) => ({
                                ukuran: d.ukuran,
                                stok: d.stok,
                                harga_jual: d.harga_jual,
                                total_notional: d.total_notional,
                            })),
                        });
                    });
                }
            });
        });
    } else if (filterLevel === "jenis") {
        (data as MerkJenisType[]).forEach((merkItem) => {
            if (merkItem.jenis) {
                merkItem.jenis.forEach((jenisItem) => {
                    const detailArray = jenisItem.ukuran.map((ukuran) => ({
                        ukuran: ukuran.ukuran,
                        stok: ukuran.detail[0].jumlah,
                        harga_jual: ukuran.detail[0].harga_jual,
                        total_notional: ukuran.detail[0].total_notional,
                    }));

                    flatData.push({
                        merk: merkItem.merk,
                        jenis: jenisItem.jenis,
                        produk: "", // Empty for jenis level
                        detail: detailArray,
                    });
                });
            }
        });
    } else {
        (data as MerkResponseType[]).forEach((merkItem) => {
            flatData.push({
                merk: merkItem.merk,
                jenis: "", // Empty for merk level
                produk: "", // Empty for merk level
                detail: [
                    {
                        ukuran: "", // Empty for merk level
                        stok: merkItem.total_stok,
                        harga_jual: 0, // Not relevant for merk level
                        total_notional: merkItem.total_notional,
                    },
                ],
            });
        });
    }

    return flatData;
};

const columns: ColumnDef<TableDataType>[] = [
    {
        id: "merk",
        enableHiding: false,
        header: "Merk",
        accessorFn: (row) => row.merk,
        cell: (props) => <span>{props.getValue() as string}</span>,
    },
    {
        id: "jenis",
        header: "Jenis",
        accessorFn: (row) => row.jenis,
        cell: (props) => <span>{props.getValue() as string}</span>,
    },
    {
        id: "produk",
        header: "Produk",
        accessorFn: (row) => row.produk,
        cell: (props) => <span>{props.getValue() as string}</span>,
    },
    {
        id: "ukuran",
        header: "Ukuran",
        accessorFn: (row) => row.detail,
        cell: (props) => (
            <div className="grid gap-y-2">
                {(props.getValue() as DetailType[]).map((detail, idx) => (
                    <span key={idx}>{detail.ukuran}</span>
                ))}
            </div>
        ),
    },
    {
        id: "stok",
        enableHiding: true,
        header: "Stok",
        accessorFn: (row) => row.detail,
        cell: (props) => {
            const details = props.getValue() as DetailType[];
            const table = props.table;
            const isUkuranVisible =
                table.getState().columnVisibility.ukuran !== false;

            if (isUkuranVisible) {
                return (
                    <div className="grid gap-y-2">
                        {details.map((detail, idx) => (
                            <span key={idx}>{detail.stok}</span>
                        ))}
                    </div>
                );
            } else {
                const totalStok = details.reduce((sum, detail) => sum + detail.stok, 0);
                return <span>{totalStok}</span>;
            }
        },
    },
    {
        id: "harga_jual",
        header: "Harga Jual",
        accessorFn: (row) => row.detail,
        cell: (props) => (
            <div className="grid gap-y-2">
                {(props.getValue() as DetailType[]).map((detail, idx) => (
                    <span key={idx}>Rp {detail.harga_jual.toLocaleString("id-ID")}</span>
                ))}
            </div>
        ),
    },
    {
        id: "total_notional",
        header: "Total Notional",
        accessorFn: (row) => row.detail,
        cell: (props) => {
            const details = props.getValue() as DetailType[];
            const table = props.table;
            const isUkuranVisible =
                table.getState().columnVisibility.ukuran !== false;

            if (isUkuranVisible) {
                return (
                    <div className="grid gap-y-2">
                        {details.map((detail, idx) => (
                            <span key={idx}>
                Rp {detail.total_notional.toLocaleString("id-ID")}
              </span>
                        ))}
                    </div>
                );
            } else {
                const totalNotional = details.reduce(
                    (sum, detail) => sum + detail.total_notional,
                    0
                );
                return <span>Rp {totalNotional.toLocaleString("id-ID")}</span>;
            }
        },
    },
];

const getFilterLevel = (columnVisibility: VisibilityState) => {
    if (columnVisibility.produk === false && columnVisibility.jenis === false) {
        return "merk";
    } else if (columnVisibility.produk === false) {
        return "jenis";
    }
    return "produk";
};

const calculateTotals = (data: TableDataType[]) => {
    let totalStok = 0;
    let totalNotional = 0;

    data.forEach((item) => {
        item.detail.forEach((detail) => {
            totalStok += detail.stok;
            totalNotional += detail.total_notional;
        });
    });

    return {
        totalStok,
        totalNotional,
    };
};

function FinalStok() {
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({
            jenis: true,
            produk: true,
            ukuran: true,
            harga_jual: true,
        });
    const [currentFilterLevel, setCurrentFilterLevel] = React.useState("produk");

    const filterLevel = React.useMemo(
        () => getFilterLevel(columnVisibility),
        [columnVisibility]
    );

    React.useEffect(() => {
        setCurrentFilterLevel(filterLevel);
    }, [filterLevel]);

    React.useEffect(() => {
        if (filterLevel === "merk") {
            setColumnVisibility((prev) => ({
                ...prev,
                ukuran: false,
                harga_jual: false,
            }));
        }
    }, [filterLevel]);

    React.useEffect(() => {
        if (columnVisibility.ukuran === false) {
            setColumnVisibility((prev) => ({
                ...prev,
                harga_jual: false,
            }));
        }
    }, [columnVisibility.ukuran]);

    const {data, isLoading} = useQuery({
        queryKey: ["final-stok", filterLevel],
        queryFn: async () => {
            const response = await api.get(
                `/api/produk/final-stok?filter=${filterLevel}`
            );
            return response.data;
        },
    });

    const transformedData = React.useMemo(() => {
        if (!data?.data) return [];
        return transformData(data.data, filterLevel);
    }, [data, filterLevel]);

    const hiddenColumns = React.useMemo(() => {
        return Object.entries(columnVisibility)
            .filter(([_, isVisible]) => !isVisible)
            .map(([key]) => {
                const column = columns.find((col) => col.id === key);
                return column ? String(column.header) : key;
            });
    }, [columnVisibility]);

    const totals = React.useMemo(() => {
        return calculateTotals(transformedData);
    }, [transformedData]);

    const currentColumns = React.useMemo(() => {
        const baseColumns: ColumnDef<TableDataType>[] = columns;

        if (currentFilterLevel === "merk") {
            return baseColumns.filter(
                (col) => col.id && !["ukuran", "harga_jual"].includes(col.id)
            );
        }

        return baseColumns;
    }, [currentFilterLevel]);

    const handleColumnVisibilityChange = (newVisibility: VisibilityState) => {
        if (newVisibility.harga_jual === true && newVisibility.ukuran === false) {
            newVisibility.harga_jual = false;
        }
        setColumnVisibility(newVisibility);
    };

    return (
        <div className={`h-nav p-8 transition-all duration-300`}>
            <div className="w-full h-[7rem]">
                <h1 className="text-H1">FINAL STOK</h1>

                <div className="mt-2 text-sm text-gray-500">
                    Hidden columns: {hiddenColumns.join(", ")}
                </div>
            </div>

            <Table
                className="text-black"
                tableClassName="max-h-[calc(100vh-325px)]"
                data={transformedData}
                columns={currentColumns}
                columnToggle={{
                    enabled: true,
                    title: "Tampilkan Kolom",
                }}
                isLoading={isLoading}
                footers={
                    <div className="flex justify-between px-2">
                        {/* <span>Total Produk: {transformedData.length}</span> */}
                        <span>Total Stok: {totals.totalStok.toLocaleString("id-ID")}</span>
                        <span>
              Total Notional: Rp {totals.totalNotional.toLocaleString("id-ID")}
            </span>
                    </div>
                }
                withFilter
                onColumnVisibilityChange={handleColumnVisibilityChange}
            />
        </div>
    );
}

export default withAuth(FinalStok, "admin");
