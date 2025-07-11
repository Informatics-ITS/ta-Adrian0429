package dto

import (
	"bumisubur-be/entity"
	"errors"
)

const (
	MESSAGE_FAILED_CREATE_CABANG    = "gagal mendaftarkan cabang baru"
	MESSAGE_FAILED_GET_ALL_CABANG   = "gagal mengambil semua data cabang"
	MESSAGE_FAILED_GET_CABANG_BY_ID = "gagal mengambil data cabang berdasarkan id"
	MESSAGE_FAILED_UPDATE_CABANG    = "gagal memperbarui data cabang"
	MESSAGE_FAILED_DELETE_CABANG    = "gagal menghapus cabang"

	MESSAGE_SUCCESS_CREATE_CABANG    = "sukses mendaftarkan cabang baru"
	MESSAGE_SUCCESS_GET_ALL_CABANG   = "sukses mengambil semua data cabang"
	MESSAGE_SUCCESS_GET_CABANG_BY_ID = "sukses mengambil data cabang berdasarkan id"
	MESSAGE_SUCCESS_UPDATE_CABANG    = "sukses memperbarui data cabang"
	MESSAGE_SUCCESS_DELETE_CABANG    = "sukses menghapus cabang"
)

var (
	ErrCreateCabang        = errors.New("gagal mendaftarkan cabang baru")
	ErrGetAllCabang        = errors.New("gagal mengambil semua data cabang")
	ErrGetCabangByID       = errors.New("gagal mengambil data cabang berdasarkan id")
	ErrUpdateCabang        = errors.New("gagal memperbarui data cabang")
	ErrDeleteCabang        = errors.New("gagal menghapus cabang")
	ErrCabangAlreadyExists = errors.New("cabang sudah terdaftar")
	ErrCabangNotFound      = errors.New("cabang tidak ditemukan")
)

type (
	CabangRequest struct {
		Name       string `json:"name" form:"name"`
		Alamat     string `json:"alamat" form:"alamat"`
		Keterangan string `json:"keterangan" form:"keterangan"`
	}

	CabangResponse struct {
		ID         int    `json:"id"`
		Name       string `json:"name"`
		Alamat     string `json:"alamat"`
		Keterangan string `json:"keterangan"`
	}

	GetAllCabangRepositoryResponse struct {
		Data []entity.Cabang
		PaginationResponse
	}

	CabangPaginationResponse struct {
		Data               []CabangResponse `json:"data"`
		PaginationResponse `json:"pagination"`
	}
)
