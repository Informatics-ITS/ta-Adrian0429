package dto

import (
	"errors"
	"time"
)

const (
	MESSAGE_FAILED_CREATE_TRANSAKSI    = "gagal membuat transaksi"
	MESSAGE_FAILED_GET_INDEX_TRANSAKSI = "gagal mengambil index data transaksi"
	MESSAGE_FAILED_GET_ALL_TRANSAKSI   = "gagal mengambil semua data transaksi"
	MESSAGE_FAILED_GET_TRANSAKSI_BY_ID = "gagal mengambil data transaksi berdasarkan id"
	MESSAGE_FAILED_UPDATE_TRANSAKSI    = "gagal memperbarui data transaksi"
	MESSAGE_FAILED_DELETE_TRANSAKSI    = "gagal menghapus transaksi"

	MESSAGE_SUCCESS_CREATE_TRANSAKSI    = "berhasil membuat transaksi"
	MESSAGE_SUCCESS_GET_INDEX_TRANSAKSI = "berhasil mengambil index data transaksi"
	MESSAGE_SUCCESS_GET_ALL_TRANSAKSI   = "berhasil mengambil semua data transaksi"
	MESSAGE_SUCCESS_GET_TRANSAKSI_BY_ID = "berhasil mengambil data transaksi berdasarkan id"
	MESSAGE_SUCCESS_UPDATE_TRANSAKSI    = "berhasil memperbarui data transaksi"
	MESSAGE_SUCCESS_DELETE_TRANSAKSI    = "berhasil menghapus transaksi"
)

var (
	ErrCreateTransaksi        = errors.New("gagal membuat transaksi")
	ErrGetAllTransaksi        = errors.New("gagal mengambil semua data transaksi")
	ErrGetTransaksiByID       = errors.New("gagal mengambil data transaksi berdasarkan id")
	ErrUpdateTransaksi        = errors.New("gagal memperbarui data transaksi")
	ErrDeleteTransaksi        = errors.New("gagal menghapus transaksi")
	ErrTransaksiAlreadyExists = errors.New("transaksi sudah terdaftar")
	ErrTransaksiNotFound      = errors.New("transaksi tidak ditemukan")
)

type (
	CreateTransaksi struct {
		MetodeBayar string             `json:"metode_bayar"`
		TotalHarga  float64            `json:"total_harga"`
		Diskon      float64            `json:"diskon"`
		Produks     []TransaksiProduks `json:"produks"`
	}

	TransaksiProduks struct {
		DetailProdukID int `json:"detail_produk_id"`
		JumlahProduk   int `json:"jumlah_produk"`
	}

	TransaksiResponse struct {
		ID               int64     `json:"id"`
		TanggalTransaksi time.Time `json:"tanggal_transaksi"`
		TotalHarga       float64   `json:"total_harga"`
		MetodeBayar      string    `json:"metode_bayar"`
		Diskon           float64   `json:"diskon"`
	}

	RepoGetTransaksiNota struct {
		Data               []GetTransaksiNotaRepo `json:"data"`
		PaginationResponse `json:"pagination"`
	}

	GetTransaksiNotaRepo struct {
		IDTransaksi      string  `json:"id_transaksi"`
		TotalProduk      int     `json:"total_produk"`
		TotalPendapatan  float64 `json:"total_pendapatan"`
		TanggalTransaksi string  `json:"tanggal_transaksi"`
		DiskonTransaksi  float64 `json:"diskon_transaksi"`
	}

	GetTransaksiNota struct {
		IDTransaksi      string                `json:"id_transaksi"`
		TotalProduk      int                   `json:"total_produk"`
		TotalPendapatan  float64               `json:"total_pendapatan"`
		TanggalTransaksi string                `json:"tanggal_transaksi"`
		DiskonTransaksi  float64               `json:"diskon_transaksi"`
		TotalProfit      float64               `json:"total_profit"`
		DetailTransaksi  []DetailTransaksiNota `json:"detail_transaksi"`
	}

	DetailTransaksiNota struct {
		Merk        string  `json:"merk"`
		NamaProduk  string  `json:"nama_produk"`
		Jenis       string  `json:"jenis"`
		Ukuran      string  `json:"ukuran"`
		JumlahItem  int     `json:"jumlah_item"`
		HargaProduk float64 `json:"harga_produk"`
		TotalProfit float64 `json:"total_profit"`
	}

	GetTransaksiNotaResponse struct {
		Data               []GetTransaksiNota `json:"data"`
		SumTotalProfit     float64            `json:"sum_total_profit"`
		PaginationResponse `json:"pagination"`
	}

	GetTransaksiProdukResponse struct {
		Data               []GetTransaksiProduk `json:"data"`
		SumTotalProfit     float64              `json:"sum_total_profit"`
		PaginationResponse `json:"pagination"`
	}

	GetTransaksiProduk struct {
		NomorNota        int     `json:"nomor_nota"`
		ProdukID         string  `json:"produk_id"`
		BarcodeID        string  `json:"barcode_id"`
		DetailID         string  `json:"detail_id"`
		NamaProduk       string  `json:"nama_produk"`
		Merk             string  `json:"merk"`
		Jenis            string  `json:"jenis"`
		Ukuran           string  `json:"ukuran"`
		Warna            string  `json:"warna"`
		TanggalTransaksi string  `json:"tanggal_transaksi"`
		TotalBarang      int     `json:"total_barang"`
		TotalPendapatan  float64 `json:"total_pendapatan"`
		TotalProfit      float64 `json:"total_profit"`
	}

	GetTransaksiProdukDetail struct {
		TotalBarang      int       `json:"total_barang"`
		TotalPendapatan  float64   `json:"total_pendapatan"`
		TanggalTransaksi time.Time `json:"tanggal_transaksi"`
	}

	IndexTransaksi struct {
		IDProduk   int     `json:"id_produk"`
		NamaProduk string  `json:"nama_produk"`
		BarcodeID  string  `json:"barcode_id"`
		HargaJual  float64 `json:"harga_jual"`
		Merk       string  `json:"merk"`

		Sizes []SizeIndexTransaksi `json:"sizes"`
	}

	IndexTransaksiRepo struct {
		IDProduk   int     `json:"id_produk"`
		NamaProduk string  `json:"nama_produk"`
		BarcodeID  string  `json:"barcode_id"`
		HargaJual  float64 `json:"harga_jual"`
	}

	SizeIndexTransaksi struct {
		Ukuran  string                 `json:"ukuran"`
		Details []DetailIndexTransaksi `json:"details"`
	}

	DetailIndexTransaksi struct {
		DetailProdukID int    `json:"detail_produk_id"`
		Warna          string `json:"warna"`
		Stok           int    `json:"stok"`
	}

)
