"use client";
import Button from "@/app/components/button/Button";
import React, {useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import withAuth from "@/app/components/hoc/withAuth";
import {useMutation, useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {ApiError} from "@/types/api";
import {AxiosError, AxiosResponse} from "axios";
import {cn} from "@/lib/utils";
import {TransactionTable} from "./components/TransaksiTable";
import {TransactionNota} from "./components/TransaksiNota";
import {PrintReceipt} from "@/utils/printReceipt";
import {handlePrintMobile} from "@/utils/printMobile";
import {useIsMobile} from "@/utils/useIsMobile";
import {CreateTransaction, Product, SearchForm, TransactionItem,} from "@/types/transaksi";

export default withAuth(Transaksi, "kasir");

function Transaksi() {
    const methods = useForm<SearchForm>({
        mode: "onChange",
    });

    const isMobile = useIsMobile();

    const {
        data: productData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["produk"],
        queryFn: async () => {
            const response = await api.get("/api/transaksi/index");
            return response.data.data;
        },
    });

    const [transactionItems, setTransactionItems] = useState<TransactionItem[]>(
        []
    );
    const [barcodeInput, setBarcodeInput] = useState<string>("");

    const [discount, setDiscount] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        string | null
    >(null);

    const {reset, handleSubmit} = methods;

    const [response, setResponse] = useState("not submitted");

    const [transaksiError, setTransaksiError] = useState<boolean>(false);

    const [lastPrintData, setLastPrintData] = useState<{
        items: TransactionItem[];
        metode_bayar: string;
        total_harga: number;
        diskon: number;
        nomor_nota: string;
    } | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [printFailed, setPrintFailed] = useState(false);

    const handlePrintRetry = async () => {
        if (!lastPrintData) return;

        setIsPrinting(true);
        setPrintFailed(false);

        try {
            // await sendPrintJob(
            //   selectedPrinter,
            //   lastPrintData.items,
            //   lastPrintData.metode_bayar,
            //   lastPrintData.total_harga,
            //   lastPrintData.diskon,
            //   lastPrintData.nomor_nota
            // );
            {
                isMobile
                    ? await handlePrintMobile(lastPrintData.nomor_nota)
                    : await PrintReceipt(lastPrintData.nomor_nota);
            }
            toast.success("Struk berhasil dicetak!");
            setResponse("submitted");
            setPrintFailed(false);
        } catch (error) {
            console.error("Printing error:", error);
            toast.error("Gagal mencetak struk. Silakan coba lagi.");
            setPrintFailed(true);
        } finally {
            setIsPrinting(false);
        }
    };

    const {mutate: TransaksiMutation, isPending} = useMutation<
        AxiosResponse,
        AxiosError<ApiError>,
        CreateTransaction
    >({
        mutationFn: async (data: CreateTransaction) => {
            return await api.post("/api/transaksi", data);
        },
        onSuccess: async (response, variables) => {
            try {
                setLastPrintData({
                    items: transactionItems,
                    metode_bayar: variables.metode_bayar,
                    total_harga: variables.total_harga,
                    diskon: variables.diskon,
                    nomor_nota: String(response.data.data.id),
                });

                setIsPrinting(true);
                // await sendPrintJob(
                //   selectedPrinter,
                //   transactionItems,
                //   variables.metode_bayar,
                //   variables.total_harga,
                //   variables.diskon,
                //   String(response.data.data.id)
                // );
                {
                    isMobile
                        ? await handlePrintMobile(response.data.data.id)
                        : await PrintReceipt(response.data.data.id);
                }
                toast.success(
                    `${
                        isMobile
                            ? "Transaksi berhasil dan aplikasi telah dibuka!"
                            : "Transaksi berhasil dan struk telah dicetak!"
                    }`
                );
                setPrintFailed(false);
                setResponse("submitted");
            } catch (error) {
                toast("Transaksi berhasil tetapi gagal mencetak struk!", {
                    icon: "⚠️",
                });
                setTransaksiError(true)
                console.error("Printing error:", error);
                setPrintFailed(true);
            } finally {
                setIsPrinting(false);
            }

            reset();
            setTransactionItems([]);
            setDiscount(0);
            setSelectedPaymentMethod(null);
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const onSubmit = () => {
        if (!selectedPaymentMethod) {
            toast.error("Harap pilih metode pembayaran.");
            return;
        }

        var totalPrice = transactionItems.reduce((total, item) => {
            // Add main item subtotal
            let itemTotal = item.subtotal;
            // Add subitems subtotal
            if (item.subItems) {
                itemTotal += item.subItems.reduce(
                    (subTotal, subItem) => subTotal + subItem.subtotal,
                    0
                );
            }
            return total + itemTotal;
        }, 0);

        if (discount > 0) {
            totalPrice = totalPrice - (totalPrice * discount) / 100;
        }

        // Collect all items including subitems
        const products = transactionItems.flatMap((item) => {
            const mainProduct = productData?.find(
                (p: any) => p.id_produk === item.id_produk
            );
            const items = [];

            // Add main item
            if (mainProduct) {
                const size = mainProduct.sizes.find(
                    (s: any) => s.ukuran === item.ukuran
                );
                const detail = size?.details.find((d: any) => d.warna === item.warna);
                if (detail) {
                    items.push({
                        detail_produk_id: detail.detail_produk_id,
                        jumlah_produk: item.jumlah,
                    });
                }
            }

            // Add subitems
            if (item.subItems) {
                item.subItems.forEach((subItem) => {
                    const size = mainProduct?.sizes.find(
                        (s: any) => s.ukuran === subItem.ukuran
                    );
                    const detail = size?.details.find(
                        (d: any) => d.warna === subItem.warna
                    );
                    if (detail) {
                        items.push({
                            detail_produk_id: detail.detail_produk_id,
                            jumlah_produk: subItem.jumlah,
                        });
                    }
                });
            }

            return items;
        });

        if (
            products.some((product) => product.detail_produk_id === null) ||
            products.length === 0
        ) {
            toast.error(
                "Tidak ada produk yang ditambahkan! atau produk yang dipilih tidak valid."
            );
            return;
        }

        const data = {
            metode_bayar: selectedPaymentMethod,
            total_harga: totalPrice,
            produks: products,
            diskon: discount,
        };

        TransaksiMutation(data);
    };

    const subtotal = transactionItems.reduce(
        (total, item) => total + item.subtotal,
        0
    );

    const total = subtotal - (subtotal * discount) / 100;

    if (isLoading) {
        return <div>Loading products...</div>;
    }

    if (isError) {
        return <div>Error loading products</div>;
    }

    const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBarcodeInput(e.target.value);
    };

    const handleAddProduct = (e: React.MouseEvent) => {
        e.preventDefault();
        const product = productData?.find(
            (p: Product) => p.barcode_id === barcodeInput
        );

        if (!product) {
            toast.error("Produk tidak ditemukan!");
            return;
        }

        const isProductExist = transactionItems.some(
            (item) => item.barcode_id === product.barcode_id
        );

        if (isProductExist) {
            toast.error("Produk sudah ditambahkan!");
            return;
        }

        if (product.sizes.length > 0) {
            const defaultSize = product.sizes[0];
            const defaultColor = defaultSize.details[0];

            const newItem: TransactionItem = {
                id_produk: product.id_produk,
                nama_produk: product.nama_produk,
                barcode_id: product.barcode_id,
                ukuran: defaultSize.ukuran,
                warna: defaultColor.warna,
                harga: product.harga_jual,
                jumlah: 1,
                subtotal: product.harga_jual,
            };

            setTransactionItems((prev) => [...prev, newItem]);
            toast.success(`Berhasil menambahkan produk!`);
        }

        setBarcodeInput("");
    };

    const handleRemoveItem = (index: number, subIndex?: number) => {
        const updatedItems = [...transactionItems];
        if (typeof subIndex === "number") {
            updatedItems[index].subItems = updatedItems[index].subItems?.filter(
                (_, i) => i !== subIndex
            );
        } else {
            updatedItems.splice(index, 1);
        }
        setTransactionItems(updatedItems);
    };

    const handleQuantityChange = (
        index: number,
        newQuantity: number,
        subIndex?: number
    ) => {
        const updatedItems = [...transactionItems];
        if (typeof subIndex === "number") {
            if (updatedItems[index].subItems?.[subIndex]) {
                updatedItems[index].subItems[subIndex].jumlah = newQuantity;
                updatedItems[index].subItems[subIndex].subtotal =
                    updatedItems[index].subItems[subIndex].harga * newQuantity;
            }
        } else {
            updatedItems[index].jumlah = newQuantity;
            updatedItems[index].subtotal = updatedItems[index].harga * newQuantity;
        }
        setTransactionItems(updatedItems);
    };

    const handleSizeChange = (
        index: number,
        newSize: string,
        subIndex?: number
    ) => {
        const updatedItems = [...transactionItems];
        const product = productData?.find(
            (p: Product) => p.id_produk === updatedItems[index].id_produk
        );

        if (product) {
            const sizeDetails = product.sizes.find(
                (size: any) => size.ukuran === newSize
            );
            const newColor = sizeDetails?.details[0]?.warna;

            if (typeof subIndex === "number") {
                if (updatedItems[index].subItems?.[subIndex]) {
                    updatedItems[index].subItems[subIndex].ukuran = newSize;
                    updatedItems[index].subItems[subIndex].warna =
                        newColor || updatedItems[index].subItems[subIndex].warna;
                }
            } else {
                updatedItems[index].ukuran = newSize;
                updatedItems[index].warna = newColor || updatedItems[index].warna;
            }
            setTransactionItems(updatedItems);
        }
    };

    const handleColorChange = (
        index: number,
        newColor: string,
        subIndex?: number
    ) => {
        const updatedItems = [...transactionItems];
        if (typeof subIndex === "number") {
            if (updatedItems[index].subItems?.[subIndex]) {
                updatedItems[index].subItems[subIndex].warna = newColor;
            }
        } else {
            updatedItems[index].warna = newColor;
        }
        setTransactionItems(updatedItems);
    };

    const handleAddSubItem = (index: number) => {
        const currentItem = transactionItems[index];
        const product = productData?.find(
            (p: Product) => p.id_produk === currentItem.id_produk
        );

        if (!product) return;

        // Get all size-color combinations for the product
        const variants = product.sizes.flatMap((size: any) =>
            size.details.map((detail: any) => ({
                size: size.ukuran,
                color: detail.warna,
            }))
        );

        // Get currently used size-color combinations
        const usedVariants = [
            {size: currentItem.ukuran, color: currentItem.warna},
            ...(currentItem.subItems?.map((item) => ({
                size: item.ukuran,
                color: item.warna,
            })) || []),
        ];

        // Find the next available variant
        const nextVariant = variants.find(
            (variant: any) =>
                !usedVariants.some(
                    (used) => used.size === variant.size && used.color === variant.color
                )
        );

        if (!nextVariant) {
            toast.error("Semua variasi sudah ditambahkan!");
            return;
        }

        const newItem: TransactionItem = {
            ...currentItem,
            ukuran: nextVariant.size,
            warna: nextVariant.color,
            jumlah: 1,
            subtotal: currentItem.harga,
        };

        const updatedItems = [...transactionItems];
        if (!updatedItems[index].subItems) {
            updatedItems[index].subItems = [];
        }
        updatedItems[index].subItems.push(newItem);
        setTransactionItems(updatedItems);
    };

    return (
        <>
            <div className="flex h-nav w-full justify-between space-x-4 px-8">
                <div id="inner-container" className="w-[90%] h-table space-y-4">
                    <FormProvider {...methods}>
                        <form action="" className="">
                            <h1 className="text-H1">TRANSAKSI</h1>
                            <div className="flex flex-row space-x-4 mb-4 mt-2">
                                <div className="w-full h-full">
                                    <input
                                        id="barcodeInput"
                                        type="text"
                                        value={barcodeInput}
                                        onChange={handleBarcodeChange}
                                        placeholder="Cari Kode Barang, Nama Barang, Kategori"
                                        className={cn(
                                            "flex w-full rounded-lg shadow-sm",
                                            "min-h-[2.25rem] md:min-h-[2.5rem]",
                                            "px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600",
                                            "focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                                        )}
                                    />
                                </div>
                                <Button onClick={handleAddProduct} type="submit">
                                    Tambah
                                </Button>
                            </div>

                            <div
                                id="tables"
                                className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollar rounded-lg p-2 bg-[#EBEBEB] space-y-3"
                            >
                                <div className="w-full grid grid-cols-8 text-center pl-2 pr-6 gap-x-2">
                                    <p className="text-S2">Kode</p>
                                    <p className="text-S2">Nama</p>
                                    <p className="text-S2">Ukuran</p>
                                    <p className="text-S2">Warna</p>
                                    <p className="text-S2">Harga</p>
                                    <p className="text-S2">Jumlah</p>
                                    <p className="text-S2">Subtotal</p>
                                    <p className="text-S2">Aksi</p>
                                </div>

                                <div className="max-h-[calc(100vh-290px)] overflow-y-scroll custom-scrollbar">
                                    <TransactionTable
                                        transactionItems={transactionItems}
                                        productData={productData}
                                        onRemoveItem={handleRemoveItem}
                                        onQuantityChange={handleQuantityChange}
                                        onSizeChange={handleSizeChange}
                                        onColorChange={handleColorChange}
                                        onAddSubItem={handleAddSubItem}
                                    />
                                </div>

                                <div className="px-2">
                                    {transactionItems?.length > 0 ? (
                                        <p className="text-S2">
                                            Total Item: {transactionItems.length}
                                        </p>
                                    ) : (
                                        <p className="text-S2">Produk belum ditambahkan.</p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </FormProvider>
                </div>

                <TransactionNota
                    subtotal={subtotal}
                    discount={discount}
                    setDiscount={setDiscount}
                    total={total}
                    selectedPaymentMethod={selectedPaymentMethod}
                    setSelectedPaymentMethod={setSelectedPaymentMethod}
                    transactionItems={transactionItems}
                    handleSubmit={handleSubmit}
                    onSubmit={onSubmit}
                    reset={reset}
                    response={response}
                    isPending={isPending}
                    isPrinting={isPrinting}
                    isError={transaksiError}
                    printFailed={printFailed}
                    handlePrintRetry={handlePrintRetry}
                    lastPrintData={lastPrintData}
                />
            </div>
        </>
    );
}
