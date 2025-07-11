package dto

import (
	"bumisubur-be/entity"
	"errors"
	"time"
)

const (
	MESSAGE_FAILED_CREATE_PENGELUARAN    = "gagal membuat pengeluaran"
	MESSAGE_FAILED_GET_ALL_PENGELUARAN   = "gagal mengambil semua data pengeluaran"
	MESSAGE_FAILED_GET_PENGELUARAN_BY_ID = "gagal mengambil data pengeluaran berdasarkan id"
	MESSAGE_FAILED_UPDATE_PENGELUARAN    = "gagal memperbarui data pengeluaran"
	MESSAGE_FAILED_DELETE_PENGELUARAN    = "gagal menghapus pengeluaran"

	MESSAGE_SUCCESS_CREATE_PENGELUARAN    = "berhasil membuat pengeluaran"
	MESSAGE_SUCCESS_GET_ALL_PENGELUARAN   = "berhasil mengambil semua data pengeluaran"
	MESSAGE_SUCCESS_GET_PENGELUARAN_BY_ID = "berhasil mengambil data pengeluaran berdasarkan id"
	MESSAGE_SUCCESS_UPDATE_PENGELUARAN    = "berhasil memperbarui data pengeluaran"
	MESSAGE_SUCCESS_DELETE_PENGELUARAN    = "berhasil menghapus pengeluaran"
)

var (
	ErrCreatePengeluaran         = errors.New("gagal membuat pengeluaran")
	ErrGetAllPengeluaran         = errors.New("gagal mengambil semua data pengeluaran")
	ErrGetPengeluarannByID       = errors.New("gagal mengambil data pengeluaran berdasarkan id")
	ErrUpdatePengeluaran         = errors.New("gagal memperbarui data pengeluaran")
	ErrDeletePengeluaran         = errors.New("gagal menghapus pengeluaran")
	ErrPengeluarannAlreadyExists = errors.New("pengeluaran sudah terdaftar")
	ErrPengeluarannNotFound      = errors.New("pengeluaran tidak ditemukan")
)

type (
	PengeluaranRequest struct {
		NamaPengeluaran     string    `json:"nama_pengeluaran" form:"nama_pengeluaran"`
		TipePembayaran      string    `json:"tipe_pembayaran" form:"tipe_pembayaran"`
		TanggalPengeluaran  time.Time `gorm:"type:timestampz" json:"tanggal_pengeluaran" form:"tanggal_pengeluaran"`
		Description         string    `json:"description" form:"description"`
		KategoriPengeluaran string    `json:"kategori_pengeluaran" form:"kategori_pengeluaran"`
		Jumlah              float64   `json:"jumlah" form:"jumlah"`
		Tujuan              string    `json:"tujuan" form:"tujuan"`
	}

	PengeluaranResponse struct {
		ID                  int       `json:"id"`
		NamaPengeluaran     string    `json:"nama_pengeluaran" form:"nama_pengeluaran"`
		TipePembayaran      string    `json:"tipe_pembayaran" form:"tipe_pembayaran"`
		TanggalPengeluaran  time.Time `gorm:"type:timestampz" json:"tanggal_pengeluaran" form:"tanggal_pengeluaran"`
		Description         string    `json:"description" form:"description"`
		KategoriPengeluaran string    `json:"kategori_pengeluaran" form:"kategori_pengeluaran"`
		Jumlah              float64   `json:"jumlah" form:"jumlah"`
		Tujuan              string    `json:"tujuan" form:"tujuan"`
	}

	GetAllPengeluaranRepositoryResponse struct {
		Data []entity.Pengeluaran
		PaginationResponse
	}

	DataIndex struct {
		Daily   float64 `json:"daily"`
		Monthly float64 `json:"monthly"`
		Yearly  float64 `json:"yearly"`
	}

	PengeluaranPaginationResponse struct {
		Data               []PengeluaranResponse `json:"data"`
		DataIndex          DataIndex             `json:"data_index"`
		PaginationResponse `json:"pagination"`
	}
	
)
