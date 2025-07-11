package service

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"bumisubur-be/repository"
	"bytes"
	"context"
	"fmt"
	"time"

	"github.com/xuri/excelize/v2"
)

type PengeluaranService interface {
	CreatePengeluaran(ctx context.Context, req dto.PengeluaranRequest) (dto.PengeluaranResponse, error)
	GetAllPengeluaran(ctx context.Context, req dto.PaginationRequest, filter string, startDate string, endDate string) (dto.PengeluaranPaginationResponse, error)
	GetPengeluaranByID(ctx context.Context, pengeluaranID int) (dto.PengeluaranResponse, error)
	UpdatePengeluaran(ctx context.Context, req dto.PengeluaranRequest, pengeluaranID int) (dto.PengeluaranResponse, error)
	DeletePengeluaran(ctx context.Context, pengeluaranID int) error

	DownloadDataPengeluaran(ctx context.Context, filter string, start string, end string) ([]byte, error)
}

type pengeluaranService struct {
	pengeluaranRepo repository.PengeluaranRepository
}

func NewPengeluaranService(pengeluaranRepo repository.PengeluaranRepository) PengeluaranService {
	return &pengeluaranService{pengeluaranRepo: pengeluaranRepo}
}

func (s *pengeluaranService) CreatePengeluaran(ctx context.Context, req dto.PengeluaranRequest) (dto.PengeluaranResponse, error) {
	pengeluaran := entity.Pengeluaran{
		NamaPengeluaran:     req.NamaPengeluaran,
		TipePembayaran:      req.TipePembayaran,
		TanggalPengeluaran:  req.TanggalPengeluaran,
		Description:         req.Description,
		KategoriPengeluaran: req.KategoriPengeluaran,
		Jumlah:              req.Jumlah,
		Tujuan:              req.Tujuan,
	}

	result, err := s.pengeluaranRepo.CreatePengeluaran(ctx, pengeluaran)
	if err != nil {
		return dto.PengeluaranResponse{}, err
	}

	return result, nil
}

func (s *pengeluaranService) GetAllPengeluaran(ctx context.Context, req dto.PaginationRequest, filter string, startDate string, endDate string) (dto.PengeluaranPaginationResponse, error) {

	dataWithPaginate, err := s.pengeluaranRepo.GetAllPengeluaranWithPagination(ctx, req, filter, startDate, endDate)
	if err != nil {
		return dto.PengeluaranPaginationResponse{}, err
	}

	var indexPengeluaran dto.DataIndex
	var pengeluaranResponses []dto.PengeluaranResponse
	currentTime := time.Now()

	for _, pengeluaran := range dataWithPaginate.Data {
		pengeluaranResponse := dto.PengeluaranResponse{
			ID:                  pengeluaran.ID,
			NamaPengeluaran:     pengeluaran.NamaPengeluaran,
			TipePembayaran:      pengeluaran.TipePembayaran,
			TanggalPengeluaran:  pengeluaran.TanggalPengeluaran,
			Description:         pengeluaran.Description,
			KategoriPengeluaran: pengeluaran.KategoriPengeluaran,
			Jumlah:              pengeluaran.Jumlah,
			Tujuan:              pengeluaran.Tujuan,
		}
		pengeluaranResponses = append(pengeluaranResponses, pengeluaranResponse)

		if pengeluaran.TanggalPengeluaran.Year() == currentTime.Year() &&
			pengeluaran.TanggalPengeluaran.YearDay() == currentTime.YearDay() {
			indexPengeluaran.Daily += pengeluaran.Jumlah
		}

		if pengeluaran.TanggalPengeluaran.Year() == currentTime.Year() &&
			pengeluaran.TanggalPengeluaran.Month() == currentTime.Month() {
			indexPengeluaran.Monthly += pengeluaran.Jumlah
		}

		// Yearly calculation (same year)
		if pengeluaran.TanggalPengeluaran.Year() == currentTime.Year() {
			indexPengeluaran.Yearly += pengeluaran.Jumlah
		}
	}

	return dto.PengeluaranPaginationResponse{
		Data:      pengeluaranResponses,
		DataIndex: indexPengeluaran, // Include daily, monthly, yearly totals
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}

func (s *pengeluaranService) GetPengeluaranByID(ctx context.Context, pengeluaranID int) (dto.PengeluaranResponse, error) {
	pengeluaran, err := s.pengeluaranRepo.GetPengeluaranByID(ctx, pengeluaranID)
	if err != nil {
		return dto.PengeluaranResponse{}, dto.ErrGetPengeluarannByID
	}

	return dto.PengeluaranResponse{
		ID:                  pengeluaran.ID,
		NamaPengeluaran:     pengeluaran.NamaPengeluaran,
		TipePembayaran:      pengeluaran.TipePembayaran,
		TanggalPengeluaran:  pengeluaran.TanggalPengeluaran,
		Description:         pengeluaran.Description,
		KategoriPengeluaran: pengeluaran.KategoriPengeluaran,
		Jumlah:              pengeluaran.Jumlah,
		Tujuan:              pengeluaran.Tujuan,
	}, nil
}

func (s *pengeluaranService) UpdatePengeluaran(ctx context.Context, req dto.PengeluaranRequest, pengeluaranID int) (dto.PengeluaranResponse, error) {
	pengeluaran, err := s.pengeluaranRepo.GetPengeluaranByID(ctx, pengeluaranID)
	if err != nil {
		return dto.PengeluaranResponse{}, dto.ErrPengeluarannNotFound
	}

	data := entity.Pengeluaran{
		ID:                  pengeluaran.ID,
		NamaPengeluaran:     req.NamaPengeluaran,
		TipePembayaran:      req.TipePembayaran,
		TanggalPengeluaran:  req.TanggalPengeluaran,
		Description:         req.Description,
		KategoriPengeluaran: req.KategoriPengeluaran,
		Jumlah:              req.Jumlah,
		Tujuan:              req.Tujuan,
	}

	pengeluaranUpdate, err := s.pengeluaranRepo.UpdatePengeluaran(ctx, data)
	if err != nil {
		return dto.PengeluaranResponse{}, dto.ErrUpdatePengeluaran
	}

	return dto.PengeluaranResponse{
		ID:                  pengeluaranUpdate.ID,
		NamaPengeluaran:     pengeluaranUpdate.NamaPengeluaran,
		TipePembayaran:      pengeluaranUpdate.TipePembayaran,
		TanggalPengeluaran:  pengeluaranUpdate.TanggalPengeluaran,
		Description:         pengeluaranUpdate.Description,
		KategoriPengeluaran: pengeluaranUpdate.KategoriPengeluaran,
		Jumlah:              pengeluaranUpdate.Jumlah,
		Tujuan:              pengeluaranUpdate.Tujuan,
	}, nil
}

func (s *pengeluaranService) DeletePengeluaran(ctx context.Context, pengeluaranID int) error {
	pengeluaran, err := s.pengeluaranRepo.GetPengeluaranByID(ctx, pengeluaranID)
	if err != nil {
		return dto.ErrPengeluarannNotFound
	}

	err = s.pengeluaranRepo.DeletePengeluaran(ctx, pengeluaran.ID)
	if err != nil {
		return dto.ErrDeletePengeluaran
	}

	return nil
}

func (s *pengeluaranService) DownloadDataPengeluaran(ctx context.Context, filter string, start string, end string) ([]byte, error) {
	queryFilters := dto.PaginationRequest{
		Search:  "",
		Page:    1,
		PerPage: 10000,
	}

	pengeluarans, err := s.pengeluaranRepo.GetAllPengeluaranWithPagination(ctx, queryFilters, filter, start, end)
	if err != nil {
		return nil, err
	}

	f := excelize.NewFile()
	f.SetSheetName("Sheet1", "Data Pengeluaran")
	sheetIndex, err := f.GetSheetIndex("Data Pengeluaran")
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(sheetIndex)

	headers := []string{"ID", "Nama Pengeluaran", "Tipe Pembayaran", "Tanggal Pengeluaran", "Description", "Jumlah", "Tujuan"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c%d", 'A'+i, 1)
		f.SetCellValue("Data Pengeluaran", cell, header)
	}

	for i, pengeluaran := range pengeluarans.Data {
		f.SetCellValue("Data Pengeluaran", fmt.Sprintf("A%d", i+2), pengeluaran.ID)
		f.SetCellValue("Data Pengeluaran", fmt.Sprintf("B%d", i+2), pengeluaran.NamaPengeluaran)
		f.SetCellValue("Data Pengeluaran", fmt.Sprintf("C%d", i+2), pengeluaran.TipePembayaran)
		f.SetCellValue("Data Pengeluaran", fmt.Sprintf("D%d", i+2), pengeluaran.TanggalPengeluaran)
		f.SetCellValue("Data Pengeluaran", fmt.Sprintf("E%d", i+2), pengeluaran.Description)
		f.SetCellValue("Data Pengeluaran", fmt.Sprintf("F%d", i+2), pengeluaran.Jumlah)
		f.SetCellValue("Data Pengeluaran", fmt.Sprintf("G%d", i+2), pengeluaran.Tujuan)
	}

	// Save Excel content to a buffer
	buf := new(bytes.Buffer)
	if err := f.Write(buf); err != nil {
		return nil, err
	}

	// Return the buffer's bytes
	return buf.Bytes(), nil
}
