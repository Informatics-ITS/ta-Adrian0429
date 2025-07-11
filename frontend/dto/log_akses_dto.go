package dto

import (
	"errors"
)

const (
	MESSAGE_FAILED_GET_ALL_LOG  = "gagal mengambil semua data log akses"
	MESSAGE_SUCCESS_GET_ALL_LOG = "sukses mengambil semua data log akses"
)

var (
	ErrGetAllLog = errors.New("gagal mengambil semua data log akses")
)

type (
	LogAksesPaginationRequest struct {
		Search    string `form:"search"`
		StartDate string `json:"start_date" form:"start_date"`
		EndDate   string `json:"end_date" form:"end_date"`
	}

	FilterLogAkses struct {
		StartDate string `json:"start_date" form:"start_date"`
		EndDate   string `json:"end_date" form:"end_date"`
	}

	LogAksesPaginationResponse struct {
		Data []LogAksesResponse `json:"data"`
	}

	LogAksesResponse struct {
		ID         int    `json:"id"`
		Name       string `json:"name"`
		Email      string `json:"email"`
		IP         string `json:"ip_address"`
		Activity   string `json:"activity"`
		Token      string `json:"token"`
		Payload    string `json:"payload"`
		Created_At string `json:"created_at"`
	}
)
