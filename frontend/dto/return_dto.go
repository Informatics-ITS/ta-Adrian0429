package dto

import (
	"errors"
	"time"
)

const (
	MESSAGE_FAILED_CREATE_RETURN               = "gagal membuat return"
	MESSAGE_FAILED_GET_INDEX_RETURN            = "gagal mengambil index data return"
	MESSAGE_FAILED_GET_ALL_RETURN              = "gagal mengambil semua data return"
	MESSAGE_FAILED_GET_RETURN_BY_ID            = "gagal mengambil data return berdasarkan id"
	MESSAGE_FAILED_UPDATE_RETURN               = "gagal memperbarui data return"
	MESSAGE_FAILED_DELETE_RETURN               = "gagal menghapus return"
	MESSAGE_FAILED_GET_RETURN_HISTORY_USER     = "gagal mengambil data riwayat return user"
	MESSAGE_FAILED_GET_RETURN_HISTORY_SUPPLIER = "gagal mengambil data riwayat return supplier"

	MESSAGE_SUCCESS_CREATE_RETURN               = "berhasil membuat return"
	MESSAGE_SUCCESS_GET_INDEX_RETURN            = "berhasil mengambil index data return"
	MESSAGE_SUCCESS_GET_ALL_RETURN              = "berhasil mengambil semua data return"
	MESSAGE_SUCCESS_GET_RETURN_BY_ID            = "berhasil mengambil data return berdasarkan id"
	MESSAGE_SUCCESS_UPDATE_RETURN               = "berhasil memperbarui data return"
	MESSAGE_SUCCESS_DELETE_RETURN               = "berhasil menghapus return"
	MESSAGE_SUCCESS_GET_RETURN_HISTORY_USER     = "berhasil mengambil data riwayat return user"
	MESSAGE_SUCCESS_GET_RETURN_HISTORY_SUPPLIER = "berhasil mengambil data riwayat return supplier"
)

var (
	ErrCreateReturn        = errors.New("gagal membuat return")
	ErrGetAllReturn        = errors.New("gagal mengambil semua data return")
	ErrGetReturnByID       = errors.New("gagal mengambil data return berdasarkan id")
	ErrUpdateReturn        = errors.New("gagal memperbarui data return")
	ErrDeleteReturn        = errors.New("gagal menghapus return")
	ErrReturnAlreadyExists = errors.New("return sudah terdaftar")
	ErrReturnNotFound      = errors.New("return tidak ditemukan")
)

type (
	ReturnUser struct {
		TransaksiID      int64              `json:"id_transaksi"`
		TanggalTransaksi time.Time          `json:"tanggal_transaksi"`
		TotalHarga       float64            `json:"total_harga"`
		MetodeBayar      string             `json:"metode_bayar"`
		Diskon           float64            `json:"diskon"`
		DetailTransaksi  []DetailReturnUser `json:"detail_transaksi"`
	}

	DetailReturnUser struct {
		DetailTransaksiID int     `json:"detail_transaksi_id"`
		DetailProdukID    int     `json:"detail_produk_id"`
		Merk              string  `json:"merk"`
		NamaProduk        string  `json:"nama_produk"`
		Jenis             string  `json:"jenis"`
		Ukuran            string  `json:"ukuran"`
		JumlahItem        int     `json:"jumlah_item"`
		HargaProduk       float64 `json:"harga_produk"`
	}

	CreateReturnUser struct {
		TransaksiID     int64                    `json:"id_transaksi"`
		Alasan          string                   `json:"alasan"`
		DetailTransaksi []DetailCreateReturnUser `json:"detail_transaksi"`
	}

	DetailCreateReturnUser struct {
		DetailTransaksiID int `json:"detail_transaksi_id"`
		DetailProdukID    int `json:"detail_produk_id"`
		JumlahItem        int `json:"jumlah_item"`
	}

	ReturnSummary struct {
		DetailProdukID    int
		DetailTransaksiID int
		JumlahReturn      int
	}

	CreateReturnUserResponse struct {
		Merk        string  `json:"merk"`
		NamaProduk  string  `json:"nama_produk"`
		Jenis       string  `json:"jenis"`
		Ukuran      string  `json:"ukuran"`
		JumlahRetur int     `json:"jumlah_retur"`
		HargaProduk float64 `json:"harga_produk"`
	}

	GetReturnSupplier struct {
		RestokID   int64   `json:"restok_id"`
		ID         int     `json:"id_produk"`
		Barcode    string  `json:"barcode"`
		NamaProduk string  `json:"nama_produk"`
		Merk       string  `json:"merk"`
		Jenis      string  `json:"jenis"`
		CV         string  `json:"cv"`
		Supplier   string  `json:"supplier"`
		HargaJual  float64 `json:"harga_jual"`

		Stoks []DetailReturnSupplier `json:"stoks"`
	}

	DetailReturnSupplier struct {
		Detail_Restok_ID int    `json:"detail_restok_id"`
		Detail_Produk_ID int    `json:"detail_produk_id"`
		Ukuran           string `json:"ukuran"`
		Warna            string `json:"warna"`
		JumlahStok       int    `json:"jumlah_stok"`
		JumlahRestok     int    `json:"jumlah_restok"`
	}

	CreateReturnSupplier struct {
		RestokID        int64                        `json:"restok_id"`
		Alasan          string                       `json:"alasan"`
		DetailTransaksi []DetailCreateReturnSupplier `json:"detail_transaksi"`
	}

	DetailCreateReturnSupplier struct {
		Detail_Restok_ID int `json:"detail_restok_id"`
		Detail_Produk_ID int `json:"detail_produk_id"`
		JumlahItem       int `json:"jumlah_item"`
	}

	ReturnSummarySupplier struct {
		DetailRestokID int
		DetailProdukID int
		JumlahReturn   int
	}

	CreateReturnSupplierResponse struct {
		Merk       string  `json:"merk"`
		NamaProduk string  `json:"nama_produk"`
		Jenis      string  `json:"jenis"`
		TotalRetur float64 `json:"total_retur"`
	}

	GetHistoryReturnFilter struct {
		StartDate string `json:"start_date" form:"start_date"`
		EndDate   string `json:"end_date" form:"end_date"`
	}

	HistoryReturnUser struct {
		ReturnID      int64     `json:"return_id"`
		Alasan        string    `json:"alasan"`
		TanggalReturn time.Time `json:"tanggal_return"`
		NomorNota     string    `json:"nomor_nota"`

		DetailHistoryReturnUser []DetailHistoryReturnUser `json:"detail_return"`
	}

	DetailHistoryReturnUser struct {
		NamaProduk   string `json:"nama_produk"`
		BarcodeId    string `json:"barcode_id"`
		JumlahReturn int    `json:"jumlah_return"`
		Merk         string `json:"merk"`
		Ukuran       string `json:"ukuran"`
		Warna        string `json:"warna"`
	}

	HistoryReturnSupplier struct {
		ReturnID      int64     `json:"return_id"`
		Alasan        string    `json:"alasan"`
		TanggalReturn time.Time `json:"tanggal_return"`
		NomorRestok   string    `json:"nomor_restok"`

		DetailHistoryReturnSupplier []DetailHistoryReturnSupplier `json:"detail_return"`
	}

	DetailHistoryReturnSupplier struct {
		NamaProduk   string `json:"nama_produk"`
		BarcodeId    string `json:"barcode_id"`
		JumlahReturn int    `json:"jumlah_return"`
		Merk         string `json:"merk"`
		Ukuran       string `json:"ukuran"`
		Warna        string `json:"warna"`
		Supplier     string `json:"supplier"`
	}
)
