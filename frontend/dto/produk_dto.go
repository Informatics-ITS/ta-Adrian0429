package dto

import (
	"bumisubur-be/entity"
	"encoding/json"
	"errors"
	"time"
)

const (
	MESSAGE_FAILED_GET_INDEX_PRODUK             = "gagal mengambil index produk"
	MESSAGE_FAILED_CREATE_PRODUK                = "gagal membuat produk"
	MESSAGE_FAILED_GET_ALL_PRODUK               = "gagal mengambil semua data produk"
	MESSAGE_FAILED_GET_ALL_RESTOK               = "gagal mengambil semua data restok"
	MESSAGE_FAILED_GET_PRODUK_BY_ID             = "gagal mengambil data produk berdasarkan id"
	MESSAGE_FAILED_DELETE_DETAILED_PRODUK_BY_ID = "gagal menghapus data produk pending berdasarkan id"
	MESSAGE_FAILED_UPDATE_PRODUK                = "gagal memperbarui data produk"
	MESSAGE_FAILED_DELETE_PRODUK                = "gagal menghapus produk"

	MESSAGE_SUCCESS_CREATE_PRODUK               = "berhasil membuat produk"
	MESSAGE_SUCCESS_GET_ALL_PRODUK              = "berhasil mengambil semua data produk"
	MESSAGE_SUCCESS_GET_ALL_RESTOK              = "berhasil mengambil semua data restok"
	MESSAGE_SUCCESS_GET_PRODUK_BY_ID            = "berhasil mengambil data produk berdasarkan id"
	MESSAGE_SUCCESS_DELETE_PENDING_PRODUK_BY_ID = "berhasil menghapus data produk pending berdasarkan id"
	MESSAGE_SUCCESS_UPDATE_PRODUK               = "berhasil memperbarui data produk"
	MESSAGE_SUCCESS_DELETE_PRODUK               = "berhasil menghapus produk"
	MESSAGE_SUCCESS_GET_INDEX_PRODUK            = "berhasil mengambil index produk"
)

var (
	ErrCreateproduk        = errors.New("gagal membuat produk")
	ErrGetAllproduk        = errors.New("gagal mengambil semua data produk")
	ErrGetprodukByID       = errors.New("gagal mengambil data produk berdasarkan id")
	ErrUpdateproduk        = errors.New("gagal memperbarui data produk")
	ErrDeleteproduk        = errors.New("gagal menghapus produk")
	ErrprodukAlreadyExists = errors.New("produk sudah terdaftar")
	ErrprodukNotFound      = errors.New("produk tidak ditemukan")
)

type (
	IndexRestok struct {
		Data   []DetailIndex   `json:"data"`
		Cabang []entity.Cabang `json:"cabang"`
	}

	DetailIndex struct {
		Supplier entity.Supplier `json:"supplier"`
		Supply   []Supply        `json:"supply"`
	}

	Supply struct {
		MerkId int           `json:"merk_id"`
		Merk   string        `json:"merk"`
		Jenis  []JenisSupply `json:"jenis"`
	}

	JenisSupply struct {
		JenisId int    `json:"jenis_id"`
		Jenis   string `json:"jenis"`
	}

	ProdukRequest struct {
		BarcodeId     string  `json:"barcode_id" form:"barcode_id" binding:"required"`
		NamaProduk    string  `json:"nama_produk" form:"nama_produk" binding:"required"`
		SupplierId    int     `json:"supplier_id" form:"supplier_id" binding:"required"`
		MerkId        int     `json:"merk_id" form:"merk_id" binding:"required"`
		HargaJual     float64 `json:"harga_jual" form:"harga_jual" binding:"required"`
		CabangId      int     `json:"cabang_id" form:"cabang_id" binding:"required"`
		JenisId       int     `json:"jenis_id" form:"jenis_id" binding:"required"`
		TanggalRestok string  `json:"tanggal_restok" form:"tanggal_restok" binding:"required"`

		Detail []DetailRequest `json:"detail" form:"detail" binding:"required"`
	}

	DetailRequest struct {
		Ukuran string `json:"ukuran_produk" form:"ukuran_produk" binding:"required"`
		Stok   int    `json:"stok_produk" form:"stok_produk" binding:"required"`
		Warna  string `json:"warna_produk" form:"warna_produk" binding:"required"`
	}

	CreateProdukResponse struct {
		ID            int                    `json:"id"`
		NamaProduk    string                 `json:"nama_produk"`
		BarcodeID     string                 `json:"barcode_id"`
		HargaJual     float64                `json:"harga_jual"`
		TanggalRestok time.Time              `json:"tanggal_jual"`
		Details       []DetailProdukResponse `json:"details"`
	}

	DetailProdukResponse struct {
		BarcodeID string `json:"barcode_id"`
		Ukuran    string `json:"ukuran"`
		Warna     string `json:"warna_produk"`
		Stok      int    `json:"stok"`
	}

	GetAllProdukResponse struct {
		Data []GetAllProduk `json:"data"`
		ProdukPaginationResponse
	}

	ProdukPaginationRequest struct {
		Search  string `json:"search" form:"search"`
		Page    int    `json:"page" form:"page"`
		PerPage int    `json:"per_page" form:"per_page"`
		Order   string `json:"order" form:"order"`
	}

	ProdukPaginationResponse struct {
		Page    int   `json:"page"`
		PerPage int   `json:"per_page"`
		MaxPage int64 `json:"max_page"`
		Count   int64 `json:"count"`
	}

	RestokProdukPaginationRequest struct {
		StartDate string `json:"start_date" form:"start_date"`
		EndDate   string `json:"end_date" form:"end_date"`
		Order     string `json:"order" form:"order"`
	}

	RestokProdukPaginationResponse struct {
		StartDate string `json:"start_date" form:"start_date"`
		EndDate   string `json:"end_date" form:"end_date"`
		Order     string `json:"order" form:"order"`
	}

	IndexRestokOld struct {
		Produks      Produks        `json:"produk"`
		PossibleMerk []PossibleMerk `json:"possible_merk"`
	}

	PossibleMerk struct {
		MerkId int    `json:"merk_id"`
		Merk   string `json:"merk"`

		PossibleSupplier []PossibleSupplier `json:"possible_supplier"`
	}

	PossibleMerkRepo struct {
		MerkId int    `json:"merk_id"`
		Merk   string `json:"merk"`
	}

	PossibleSupplier struct {
		SupplierId int    `json:"supplier_id"`
		Supplier   string `json:"supplier"`
	}

	Produks struct {
		ProdukId  int     `json:"produk_id"`
		BarcodeId string  `json:"barcode_id"`
		Produk    string  `json:"produk"`
		JenisId   int     `json:"jenis_id"`
		Jenis     string  `json:"jenis"`
		CabangId  int     `json:"cabang_id"`
		Cabang    string  `json:"cabang"`
		Diskon    int     `json:"diskon"`
		HargaJual float64 `json:"harga_jual"`
	}

	// create old produk

	OldProdukRequest struct {
		ProdukId      int     `json:"produk_id" form:"produk_id" binding:"required"`
		MerkId        int     `json:"merk_id" form:"merk_id" binding:"required"`
		JenisId       int     `json:"jenis_id" form:"jenis_id" binding:"required"`
		CabangId      int     `json:"cabang_id" form:"cabang_id" binding:"required"`
		SupplierId    int     `json:"supplier_id" form:"supplier_id" binding:"required"`
		HargaJual     float64 `json:"harga_jual" form:"harga_jual" binding:"required"`
		TanggalRestok string  `json:"tanggal_restok" form:"tanggal_restok" binding:"required"`

		Details []DetailRequest `json:"details" form:"details" binding:"required"`
	}

	EditPendingRestok struct {
		RestokID      int64   `json:"restok_id" form:"restok_id" binding:"required"`
		ProdukId      int     `json:"produk_id" form:"produk_id" binding:"required"`
		MerkId        int     `json:"merk_id" form:"merk_id" binding:"required"`
		JenisId       int     `json:"jenis_id" form:"jenis_id" binding:"required"`
		CabangId      int     `json:"cabang_id" form:"cabang_id" binding:"required"`
		SupplierId    int     `json:"supplier_id" form:"supplier_id" binding:"required"`
		HargaJual     float64 `json:"harga_jual" form:"harga_jual" binding:"required"`
		TanggalRestok string  `json:"tanggal_restok" form:"tanggal_restok" binding:"required"`

		Details []DetailRequest `json:"details" form:"details" binding:"required"`
	}

	// get all produk with pagination
	GetAllProduk struct {
		ID         int     `json:"id"`
		NamaProduk string  `json:"nama_produk"`
		BarcodeID  string  `json:"barcode_id"`
		HargaJual  float64 `json:"harga_jual"`
		Merk       string  `json:"merk"`
		Jenis      string  `json:"jenis"`
		CV         string  `json:"cv"`

		Details []Details `json:"details"`
	}

	Details struct {
		Ukuran        string    `json:"ukuran"`
		DetailID      int       `json:"detail_id"`
		TanggalRestok time.Time `json:"tanggal_restok"`
		Warna         string    `json:"warna_produk"`
		Stok          int       `json:"stok"`
	}

	RepoQueryProdukCabang struct {
		ProdukID   int     `json:"produk_id"`
		NamaProduk string  `json:"nama_produk"`
		BarcodeID  string  `json:"barcode_id"`
		HargaJual  float64 `json:"harga_jual"`
		NamaCabang string  `json:"nama_cabang"`
		Merk       string  `json:"merk"`
		Jenis      string  `json:"jenis"`
	}

	ProdukSizes struct {
		Ukuran string `json:"ukuran"`
	}

	// get produk details
	ProdukDetails struct {
		ID           int     `json:"id"`
		Barcode      string  `json:"barcode"`
		NamaProduk   string  `json:"nama_produk"`
		MerkID       int     `json:"merk_id"`
		Merk         string  `json:"merk"`
		JenisID      int     `json:"jenis_id"`
		Jenis        string  `json:"jenis"`
		HargaBeli    float64 `json:"harga_beli"`
		HargaJual    float64 `json:"harga_jual"`
		CVID         int     `json:"cv_id"`
		CV           string  `json:"cv"`
		SupplierID   int     `json:"supplier_id"`
		SupplierName string  `json:"supplier_name"`

		Stoks []StokBarang `json:"stoks"`
	}

	PendingStok struct {
		RestokID   int64   `json:"restok_id"`
		ID         int     `json:"id_produk"`
		Barcode    string  `json:"barcode"`
		NamaProduk string  `json:"nama_produk"`
		Merk       string  `json:"merk"`
		Jenis      string  `json:"jenis"`
		CV         string  `json:"cv"`
		Supplier   string  `json:"supplier"`
		HargaJual  float64 `json:"harga_jual"`

		Stoks []StokBarang `json:"stoks"`
	}

	StokBarang struct {
		TanggalRestok time.Time `json:"tanggal_restok"`
		Ukuran        string    `json:"ukuran"`
		Warna         string    `json:"warna"`
		Stok          int       `json:"stok"`
	}

	DetailRestok struct {
		Ukuran string `json:"ukuran"`
		Warna  string `json:"warna"`
		Jumlah int    `json:"jumlah"`
	}

	RestokDTO struct {
		ID            int            `json:"id"`
		NamaProduk    string         `json:"nama_produk"`
		Merk          string         `json:"merk"`
		SupplierName  string         `json:"supplier_name"`
		TanggalRestok string         `json:"tanggal_restok"`
		DetailRestok  []DetailRestok `json:"detail_restok" gorm:"-"`
	}

	IndexFinalStok struct {
		Merks []string `json:"merks"`
		Jenis []string `json:"jenis"`
	}

	FilterFinalStok struct {
		StartDate string `json:"start_date" form:"start_date"`
		EndDate   string `json:"end_date" form:"end_date"`
		Merk      string `json:"merk" form:"merk"`
		Jenis     string `json:"jenis" form:"jenis"`
		Filter    string `json:"filter" form:"filter"`
	}

	FinalStokResponse struct {
		ProdukID      int     `json:"produk_id"`
		NamaProduk    string  `json:"nama_produk"`
		BarcodeID     string  `json:"barcode_id"`
		MerkID        int     `json:"merk_id"`
		MerkNama      string  `json:"merk_nama"`
		NamaJenis     string  `json:"nama_jenis"`
		Stok          int     `json:"stok"`
		Ukuran        string  `json:"ukuran"`
		Warna         string  `json:"warna"`
		HargaJual     float64 `json:"harga_jual"`
		TotalNotional float64 `json:"total_notional"`
	}

	FinalStokProdukResponse struct {
		Merk  string                       `json:"merk"`
		Jenis []FinalStokProdukDetailJenis `json:"jenis"`
	}

	FinalStokProdukDetailJenis struct {
		Jenis  string                        `json:"jenis"`
		Produk []FinalStokProdukProdukDetail `json:"produk"`
	}

	FinalStokProdukProdukDetail struct {
		Produk           string                  `json:"produk"`
		Detail           []FinalStokProdukDetail `json:"detail"`
		SumTotalNotional float64                 `json:"sum_total_notional"`
	}

	FinalStokProdukDetail struct {
		Ukuran        string  `json:"ukuran"`
		Stok          int     `json:"stok"`
		HargaJual     float64 `json:"harga_jual"`
		TotalNotional float64 `json:"total_notional"`
	}

	FinalStokJenisResponse struct {
		Merk  string                              `json:"merk"`
		Jenis []FinalStokJenisJenisDetailResponse `json:"jenis"`
	}
	FinalStokJenisJenisDetailResponse struct {
		Jenis            string                        `json:"jenis"`
		Ukuran           []FinalStokJenisUkuranRespone `json:"ukuran"`
		SumTotalNotional float64                       `json:"sum_total_notional"`
	}
	FinalStokJenisUkuranRespone struct {
		Ukuran string                         `json:"ukuran"`
		Detail []FinalStokJenisDetailResponse `json:"detail"`
	}
	FinalStokJenisDetailResponse struct {
		Jumlah        int     `json:"jumlah"`
		HargaJual     float64 `json:"harga_jual"`
		TotalNotional float64 `json:"total_notional"`
	}

	FinalGetAllMerk struct {
		ID   int    `json:"id"`
		Nama string `json:"nama"`
	}

	FinalGetAllJenisJenis struct {
		ID   int    `json:"id"`
		Nama string `json:"nama"`
	}

	FinalGetProdukDetail struct {
		Produk        string  `json:"produk"`
		Ukuran        string  `json:"ukuran"`
		Stok          int     `json:"stok"`
		HargaJual     float64 `json:"harga_jual"`
		TotalNotional float64 `json:"total_notional"`
	}

	FinalGetJenisDetail struct {
		Jenis         string  `json:"jenis"`
		Ukuran        string  `json:"ukuran"`
		Jumlah        int     `json:"jumlah"`         // Sum of stok
		HargaJual     float64 `json:"harga_jual"`     // Sample or average price
		TotalNotional float64 `json:"total_notional"` // Sum of total_notional
	}

	FinalStokMerk struct {
		Merk          string  `json:"merk"`
		TotalStok     int     `json:"total_stok"`
		TotalNotional float64 `json:"total_notional"`
	}
)

func (y Details) MarshalJSON() ([]byte, error) {
	type Alias Details
	return json.Marshal(&struct {
		TanggalRestok string `json:"tanggal_restok"`
		*Alias
	}{
		TanggalRestok: y.TanggalRestok.Format("2006-01-02"),
		Alias:         (*Alias)(&y),
	})
}

func (y StokBarang) MarshalJSON() ([]byte, error) {
	type Alias StokBarang
	return json.Marshal(&struct {
		TanggalRestok string `json:"tanggal_restok"`
		*Alias
	}{
		TanggalRestok: y.TanggalRestok.Format("2006-01-02"),
		Alias:         (*Alias)(&y),
	})
}
