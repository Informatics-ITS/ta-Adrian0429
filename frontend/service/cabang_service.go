package service

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"bumisubur-be/repository"
	"bytes"
	"context"
	"fmt"

	"github.com/xuri/excelize/v2"
)

type (
	CabangService interface {
		CreateCabang(ctx context.Context, req dto.CabangRequest) (dto.CabangResponse, error)
		GetAllCabangWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.CabangPaginationResponse, error)
		GetCabangByID(ctx context.Context, cabangID int) (dto.CabangResponse, error)
		UpdateCabang(ctx context.Context, req dto.CabangRequest, cabangID int) (dto.CabangResponse, error)
		DeleteCabang(ctx context.Context, cabangID int) error

		DownloadDataCabang(ctx context.Context) ([]byte, error)
	}

	cabangService struct {
		cabangRepo repository.CabangRepository
		jwtService JWTService
	}
)

func NewCabangService(cabangRepo repository.CabangRepository, jwtService JWTService) CabangService {
	return &cabangService{
		cabangRepo: cabangRepo,
		jwtService: jwtService,
	}
}

func (s *cabangService) CreateCabang(ctx context.Context, req dto.CabangRequest) (dto.CabangResponse, error) {
	_, flag, _ := s.cabangRepo.CheckCabangName(ctx, nil, req.Name)
	if flag {
		return dto.CabangResponse{}, dto.ErrCabangAlreadyExists
	}

	cabang := entity.Cabang{
		Name:       req.Name,
		Alamat:     req.Alamat,
		Keterangan: req.Keterangan,
	}

	cabang, err := s.cabangRepo.CreateCabang(ctx, nil, cabang)
	if err != nil {
		return dto.CabangResponse{}, err
	}

	return dto.CabangResponse{
		ID:         cabang.ID,
		Name:       cabang.Name,
		Alamat:     cabang.Alamat,
		Keterangan: cabang.Keterangan,
	}, nil
}

func (s *cabangService) GetAllCabangWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.CabangPaginationResponse, error) {
	dataWithPaginate, err := s.cabangRepo.GetAllCabangWithPagination(ctx, req)
	if err != nil {
		return dto.CabangPaginationResponse{}, err
	}

	var cabangResponses []dto.CabangResponse
	for _, cabang := range dataWithPaginate.Data {
		cabangResponse := dto.CabangResponse{
			ID:         cabang.ID,
			Name:       cabang.Name,
			Alamat:     cabang.Alamat,
			Keterangan: cabang.Keterangan,
		}

		cabangResponses = append(cabangResponses, cabangResponse)
	}

	return dto.CabangPaginationResponse{
		Data: cabangResponses,
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}

func (s *cabangService) GetCabangByID(ctx context.Context, cabangID int) (dto.CabangResponse, error) {
	cabang, err := s.cabangRepo.GetCabangByID(ctx, nil, cabangID)
	if err != nil {
		return dto.CabangResponse{}, dto.ErrGetCabangByID
	}

	return dto.CabangResponse{
		ID:         cabang.ID,
		Name:       cabang.Name,
		Alamat:     cabang.Alamat,
		Keterangan: cabang.Keterangan,
	}, nil
}

func (s *cabangService) UpdateCabang(ctx context.Context, req dto.CabangRequest, cabangID int) (dto.CabangResponse, error) {
	cabang, err := s.cabangRepo.GetCabangByID(ctx, nil, cabangID)
	if err != nil {
		return dto.CabangResponse{}, dto.ErrCabangNotFound
	}

	data := entity.Cabang{
		ID:         cabang.ID,
		Name:       req.Name,
		Alamat:     req.Alamat,
		Keterangan: req.Keterangan,
	}

	cabangUpdate, err := s.cabangRepo.UpdateCabang(ctx, nil, data)
	if err != nil {
		return dto.CabangResponse{}, dto.ErrUpdateCabang
	}

	return dto.CabangResponse{
		ID:         cabangUpdate.ID,
		Name:       cabangUpdate.Name,
		Alamat:     cabangUpdate.Alamat,
		Keterangan: cabangUpdate.Keterangan,
	}, nil
}

func (s *cabangService) DeleteCabang(ctx context.Context, cabangID int) error {
	cabang, err := s.cabangRepo.GetCabangByID(ctx, nil, cabangID)
	if err != nil {
		return dto.ErrCabangNotFound
	}

	err = s.cabangRepo.DeleteCabang(ctx, nil, cabang.ID)
	if err != nil {
		return dto.ErrDeleteCabang
	}

	return nil
}

func (s *cabangService) DownloadDataCabang(ctx context.Context) ([]byte, error) {
	cabangs, err := s.cabangRepo.GetAllCabang(ctx, nil)
	if err != nil {
		return nil, err
	}

	f := excelize.NewFile()
	f.SetSheetName("Sheet1", "Data Cabang")
	sheetIndex, err := f.GetSheetIndex("Data Cabang")
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(sheetIndex)

	headers := []string{"ID", "Nama Cabang", "Alamat", "Keterangan"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c%d", 'A'+i, 1)
		f.SetCellValue("Data Cabang", cell, header)
	}

	for i, cabang := range cabangs {
		f.SetCellValue("Data Cabang", fmt.Sprintf("A%d", i+2), cabang.ID)
		f.SetCellValue("Data Cabang", fmt.Sprintf("B%d", i+2), cabang.Name)
		f.SetCellValue("Data Cabang", fmt.Sprintf("C%d", i+2), cabang.Alamat)
		f.SetCellValue("Data Cabang", fmt.Sprintf("D%d", i+2), cabang.Keterangan)

	}

	// Save Excel content to a buffer
	buf := new(bytes.Buffer)
	if err := f.Write(buf); err != nil {
		return nil, err
	}

	// Return the buffer's bytes
	return buf.Bytes(), nil
}
