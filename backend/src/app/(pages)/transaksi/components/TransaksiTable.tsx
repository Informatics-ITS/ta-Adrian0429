import React from "react";
import { FiTrash, FiPlus } from "react-icons/fi";
import SelectInput from "@/app/components/Forms/SelectInput";
import { Product, TransactionItem } from "@/types/transaksi";
import Button from "@/app/components/button/Button";
import toast from "react-hot-toast";

interface TransactionTableProps {
  transactionItems: TransactionItem[];
  productData: Product[];
  onRemoveItem: (index: number, subIndex?: number) => void;
  onQuantityChange: (
    index: number,
    newQuantity: number,
    subIndex?: number
  ) => void;
  onSizeChange: (index: number, newSize: string, subIndex?: number) => void;
  onColorChange: (index: number, newColor: string, subIndex?: number) => void;
  onAddSubItem: (index: number) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactionItems,
  productData,
  onRemoveItem,
  onQuantityChange,
  onSizeChange,
  onColorChange,
  onAddSubItem,
}) => {
  const renderVariantRow = (
    item: TransactionItem,
    index: number,
    subIndex?: number
  ) => {
    const product = productData?.find(
      (p: Product) => p.id_produk === item.id_produk
    );
    const availableSizes = product
      ? product.sizes.map((size) => size.ukuran)
      : [];
    const availableColors =
      product?.sizes
        .find((size) => size.ukuran === item.ukuran)
        ?.details.map((detail) => detail.warna) || [];

    const getAvailableStock = () => {
      const size = product?.sizes.find((s) => s.ukuran === item.ukuran);
      const detail = size?.details.find((d) => d.warna === item.warna);
      return detail?.stok || 0;
    };

    const availableStock = getAvailableStock();

    const handleQuantityChange = (newQuantity: number) => {
      if (newQuantity <= 0) {
        newQuantity = 1;
      }
      if (newQuantity > availableStock) {
        toast.error(`Stok tersedia: ${availableStock}`);
        newQuantity = availableStock;
      }
      onQuantityChange(index, newQuantity, subIndex);
    };

    return (
      <div className={`grid grid-cols-6 text-center gap-x-2 items-center py-2`}>
        <SelectInput
          id={`${item.barcode_id}-${index}-${subIndex ?? "main"}`}
          value={item.ukuran}
          onChange={(e) => onSizeChange(index, e.target.value, subIndex)}
        >
          {availableSizes.map((options: string, idx: number) => (
            <option key={idx} value={options}>
              {options}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          id={`${item.barcode_id}-color-${index}-${subIndex ?? "main"}`}
          value={item.warna}
          onChange={(e) => onColorChange(index, e.target.value, subIndex)}
        >
          {availableColors.map((color, idx) => (
            <option key={idx} value={color}>
              {color}
            </option>
          ))}
        </SelectInput>
        <p className="text-B2">Rp {item.harga.toLocaleString("id-ID")}</p>

        <div className="relative flex items-center justify-between bg-gray-100 rounded-full px-2 py-1 shadow-sm w-fit max-w-full">
          <button
            type="button"
            onClick={() => handleQuantityChange(item.jumlah - 1)}
            className="w-8 h-8 text-2xl font-medium flex items-center justify-center text-black bg-white rounded-full shadow hover:bg-gray-200"
          >
            -
          </button>
          <input
            type="number"
            value={item.jumlah}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10) || 1;
              handleQuantityChange(value);
            }}
            className="text-center text-B2 bg-transparent text-black w-8 no-arrows outline-none"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(item.jumlah + 1)}
            className="w-8 h-8 text-xl font-medium flex items-center justify-center text-orange-600 bg-white rounded-full shadow hover:bg-gray-200"
          >
            +
          </button>

          {/* <span className="absolute -top-4 right-0 text-xs text-gray-500">
            Stok: {availableStock}
          </span> */}
        </div>

        <p className="text-B2">Rp {item.subtotal.toLocaleString("id-ID")}</p>
        <div className="flex gap-2 justify-center">
          <div
            className="p-1 bg-[#FF2525] w-fit h-fit rounded-lg cursor-pointer"
            onClick={() => onRemoveItem(index, subIndex)}
          >
            <FiTrash className="text-lg text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-y-scroll custom-scrollbar space-y-2">
      {transactionItems.map((item, index) => (
        <div key={index} className="bg-white rounded-lg text-B3">
          <div className="py-4 px-2 space-y-2">
            <div className="grid grid-cols-8 text-center gap-x-2 items-center">
              <p className="text-B2 font-bold">{item.nama_produk}</p>
              <p className="text-B2">{item.barcode_id}</p>
              <div className="grid col-span-6">
                {/* Main variant */}
                {renderVariantRow(item, index, undefined)}

                {/* Sub-variants */}
                {item.subItems?.map((subItem, subIndex) =>
                  renderVariantRow(subItem, index, subIndex)
                )}
              </div>
            </div>

            {/* Add variant button */}
            <div className="flex justify-center pt-2 mt-2">
              <Button
                variant="outline"
                size="small"
                onClick={() => onAddSubItem(index)}
              >
                <FiPlus />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
