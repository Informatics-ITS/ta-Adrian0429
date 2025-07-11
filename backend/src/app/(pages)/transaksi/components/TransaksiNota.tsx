import React from "react";
import Button from "@/app/components/button/Button";
import {FiPrinter} from "react-icons/fi";
import {SubmitModal} from "@/app/(pages)/transaksi/components/TransaksiSubmitModal";
import {TransactionItem} from "@/types/transaksi";
import toast from "react-hot-toast";

interface TransactionNotaProps {
    subtotal: number;
    discount: number;
    setDiscount: (value: number) => void;
    total: number;
    selectedPaymentMethod: string | null;
    setSelectedPaymentMethod: (method: string) => void;
    transactionItems: TransactionItem[];
    handleSubmit: any;
    onSubmit: () => void;
    reset: () => void;
    response: string;
    isPending: boolean;
    isError: boolean;
    isPrinting: boolean;
    printFailed: boolean;
    handlePrintRetry: () => void;
    lastPrintData: any;
}

const PaymentMethod = [
    {title: "Tunai"},
    {title: "Debit"},
    {title: "Transfer"},
    {title: "QRIS"},
];

export const TransactionNota: React.FC<TransactionNotaProps> = ({
                                                                    transactionItems,
                                                                    discount,
                                                                    setDiscount,
                                                                    selectedPaymentMethod,
                                                                    setSelectedPaymentMethod,
                                                                    handleSubmit,
                                                                    onSubmit,
                                                                    reset,
                                                                    response,
                                                                    isPending,
                                                                    isError,
                                                                    isPrinting,
                                                                    printFailed,
                                                                    handlePrintRetry,
                                                                    lastPrintData,
                                                                }) => {
    const calculateTotal = () => {
        return transactionItems.reduce((acc, item) => {
            let itemTotal = item.subtotal;

            if (item.subItems && item.subItems.length > 0) {
                itemTotal += item.subItems.reduce(
                    (subAcc, subItem) => subAcc + subItem.subtotal,
                    0
                );
            }

            return acc + itemTotal;
        }, 0);
    };

    const subtotal = calculateTotal();
    const total = subtotal - (subtotal * discount) / 100;

    return (
        <div className="w-[30%]">
            <div className="w-full rounded-lg flex flex-col justify-between shadow-xl p-5 h-[calc(100%-20px)]">
                <div className="space-y-5">
                    <h2 className="text-H2">Nota Transaksi</h2>
                    <div className="w-full text-C1 text-end">
                        <p>#XXJLJ</p>
                        <p>23/02/24 12:38:56</p>
                        <p>Ai Dominic</p>
                    </div>

                    {/* Display detail nota */}
                    {/* <div className="space-y-2 border-b-2 border-dashed border-black py-2">
          {transactionItems.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm">
                <span>
                  {item.nama_produk} ({item.ukuran}-{item.warna})
                </span>
                <span>Rp. {item.subtotal.toLocaleString("id-ID")}</span>
              </div>
              {item.subItems?.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className="flex justify-between text-sm pl-4 text-gray-600"
                >
                  <span>
                    └ Var. {subItem.ukuran}-{subItem.warna}
                  </span>
                  <span>Rp. {subItem.subtotal.toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          ))}
        </div> */}

                    <div>
                        <div className="flex justify-between items-center">
                            <p className="text-B2 max-[950px]:text-[14px]">Subtotal</p>
                            <p className="text-S1 max-[950px]:text-[14px]">
                                Rp. {subtotal.toLocaleString("id-ID")}
                            </p>
                        </div>
                        <div
                            className="flex justify-between items-center border-b-2 border-dashed border-black py-2 mb-2">
                            <p className="text-B2 max-[950px]:text-[14px]">Diskon</p>
                            <div className="w-full flex justify-end items-center gap-2 max-[950px]:text-[14px]">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discount}
                                    className="ring-1 px-2 py-1 ring-gray-200 rounded-lg lg:w-[50%] xl:w-[30%]"
                                    onChange={(e) =>
                                        setDiscount(Math.min(Math.max(0, +e.target.value), 100))
                                    }
                                />
                                %
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-B2 max-[950px]:text-[14px]">Total</p>
                            <p className="text-S1 text-brand-600 font-semibold max-[950px]:text-[14px]">
                                Rp. {total.toLocaleString("id-ID")}
                            </p>
                        </div>

                        <h2 className="text-H2 mt-8">Metode Pembayaran</h2>
                        <div className="flex flex-wrap w-full">
                            {PaymentMethod.map((method) => (
                                <button
                                    key={method.title}
                                    onClick={() => setSelectedPaymentMethod(method.title)}
                                    className={`mr-2 my-2 px-4 py-2 rounded-lg max-[950px]:px-2 max-[950px]:py-1 max-[950px]:my-1 ${
                                        selectedPaymentMethod === method.title
                                            ? "bg-brand-600 text-white"
                                            : "bg-brand-200 text-white hover:bg-brand-300"
                                    }`}
                                >
                                    {method.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full mt-10 space-y-5">
                    <SubmitModal
                        message="Data Transaksi berhasil ditambah!"
                        path="/riwayat-transaksi"
                        onSubmit={handleSubmit(onSubmit)}
                        onReset={reset}
                        response={response}
                        isError={isError}
                    >
                        {({openModal}) => (
                            <>
                                <Button
                                    size="large"
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => {
                                        if (transactionItems.length === 0) {
                                            toast.error("Tidak ada produk.");
                                            return;
                                        }
                                        if (!selectedPaymentMethod) {
                                            toast.error("Harap pilih metode pembayaran.");
                                            return;
                                        }
                                        handleSubmit(() => {
                                            openModal();
                                        })();
                                    }}
                                    isLoading={isPending || isPrinting}
                                >
                                    Cetak Nota
                                </Button>

                                {printFailed && lastPrintData && (
                                    <Button
                                        size="large"
                                        variant="outline primary"
                                        className="w-full mt-2 flex"
                                        onClick={handlePrintRetry}
                                        isLoading={isPrinting}
                                        leftIcon={FiPrinter}
                                    >
                                        Cetak Ulang Struk Transaksi Terakhir
                                    </Button>
                                )}
                            </>
                        )}
                    </SubmitModal>
                    <Button size="large" variant="outline primary" className="w-full">
                        Batal
                    </Button>
                </div>
            </div>
        </div>
    );
};
