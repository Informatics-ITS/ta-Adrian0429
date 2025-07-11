export type ProductSize = {
  ukuran: string;
  details: {
    detail_produk_id: number;
    warna: string;
    stok: number;
  }[];
};

export type Product = {
  id_produk: string;
  nama_produk: string;
  barcode_id: string;
  harga_jual: number;
  sizes: ProductSize[];
};

export type TransactionItem = {
  id_produk: string;
  nama_produk: string;
  barcode_id: string;
  ukuran: string;
  warna: string;
  harga: number;
  jumlah: number;
  subtotal: number;
  subItems?: TransactionItem[];
};

export type CreateTransaction = {
  metode_bayar: string;
  total_harga: number;
  diskon: number;
  produks: TransactionDetail[];
};

export type TransactionDetail = {
  detail_produk_id: number;
  jumlah_produk: number;
};

export type SearchForm = {
  query: string;
};
