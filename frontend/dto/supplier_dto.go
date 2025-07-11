package dto

import (
	"bumisubur-be/entity"
	"errors"
)

const (
	MESSAGE_FAILED_CREATE_SUPPLIER       = "gagal membuat supplier"
	MESSAGE_FAILED_GET_INDEX_SUPPLIER    = "gagal mengambil index data supplier"
	MESSAGE_FAILED_GET_ALL_SUPPLIER      = "gagal mengambil semua data supplier"
	MESSAGE_FAILED_GET_SUPPLIER_BY_ID    = "gagal mengambil data supplier berdasarkan id"
	MESSAGE_FAILED_UPDATE_SUPPLIER       = "gagal memperbarui data supplier"
	MESSAGE_FAILED_DELETE_SUPPLIER       = "gagal menghapus supplier"
	MESSAGE_FAILED_GET_HISTORY_TRANSAKSI = "gagal mengambil history transaksi"

	MESSAGE_SUCCESS_CREATE_SUPPLIER       = "berhasil membuat supplier"
	MESSAGE_SUCCESS_GET_INDEX_SUPPLIER    = "berhasil mengambil index data supplier"
	MESSAGE_SUCCESS_GET_ALL_SUPPLIER      = "berhasil mengambil semua data supplier"
	MESSAGE_SUCCESS_GET_SUPPLIER_BY_ID    = "berhasil mengambil data supplier berdasarkan id"
	MESSAGE_SUCCESS_UPDATE_SUPPLIER       = "berhasil memperbarui data supplier"
	MESSAGE_SUCCESS_DELETE_SUPPLIER       = "berhasil menghapus supplier"
	MESSAGE_SUCCESS_GET_HISTORY_TRANSAKSI = "berhasil mengambil history transaksi"
)

var (
	ErrCreateSupplier        = errors.New("gagal membuat supplier")
	ErrGetAllSupplier        = errors.New("gagal mengambil semua data supplier")
	ErrGetSupplierByID       = errors.New("gagal mengambil data supplier berdasarkan id")
	ErrUpdateSupplier        = errors.New("gagal memperbarui data supplier")
	ErrDeleteSupplier        = errors.New("gagal menghapus supplier")
	ErrSupplierAlreadyExists = errors.New("supplier sudah terdaftar")
	ErrSupplierNotFound      = errors.New("supplier tidak ditemukan")

	ErrCreateJenis        = errors.New("gagal membuat Jenis")
	ErrGetAllJenis        = errors.New("gagal mengambil semua data Jenis")
	ErrGetJenisByID       = errors.New("gagal mengambil data Jenis berdasarkan id")
	ErrUpdateJenis        = errors.New("gagal memperbarui data Jenis")
	ErrDeleteJenis        = errors.New("gagal menghapus Jenis")
	ErrJenisAlreadyExists = errors.New("jenis sudah terdaftar")
	ErrJenisNotFound      = errors.New("jenis tidak ditemukan")
)

type (
	SupplierRequest struct {
		Name        string        `json:"name" form:"name"`
		NoHp        string        `json:"no_hp" form:"no_hp"`
		Discount    int           `json:"discount" form:"discount"`
		MerkRequest []MerkRequest `json:"merk_request" form:"merk_request"`
	}

	MerkRequest struct {
		NamaMerk     string         `json:"nama_merk" form:"nama_merk"`
		Discount     int            `json:"discount_merk" form:"discount_merk"`
		JenisRequest []JenisRequest `json:"jenis_request" form:"jenis_request"`
	}

	JenisRequest struct {
		NamaJenis string `json:"nama_jenis" form:"nama_jenis"`
	}

	UpdateSupplyRequest struct {
		Data []MerkRequest `json:"data" form:"data"`
	}

	IndexResponse struct {
		Merk  []IndexMerk
		Jenis []IndexJenis
	}

	IndexMerk struct {
		Merk string `json:"merk"`
	}

	IndexJenis struct {
		Jenis string `json:"jenis"`
	}

	GetAllSupplierRepositoryResponse struct {
		Data []entity.Supplier
		PaginationResponse
	}

	GetAllSupplierResponse struct {
		Data               []SupplierResponse `json:"data"`
		PaginationResponse `json:"pagination"`
	}

	SupplierResponse struct {
		ID       int            `json:"id"`
		Name     string         `json:"name"`
		NoHp     string         `json:"no_hp"`
		Discount int            `json:"discount"`
		Merk     []MerkResponse `json:"merk"`
	}

	MerkResponse struct {
		NamaMerk string          `json:"nama_merk"`
		Discount int             `json:"discount_merk"`
		Jenis    []JenisResponse `json:"jenis"`
	}

	JenisResponse struct {
		ID        int    `json:"id"`
		NamaJenis string `json:"nama_jenis" form:"nama_jenis"`
	}

	MerkRestok struct {
		ID           int           `json:"id_merk" form:"id_merk"`
		NamaMerk     string        `json:"nama_merk" form:"nama_merk"`
		Discount     int           `json:"discount_merk" form:"discount_merk"`
		JenisRequest []JenisRestok `json:"jenis_request" form:"jenis_request"`
	}

	JenisRestok struct {
		ID        int    `json:"id_jenis" form:"id_jenis"`
		NamaJenis string `json:"nama_jenis" form:"nama_jenis"`
	}
)
