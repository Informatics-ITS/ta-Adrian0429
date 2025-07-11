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

type LogAksesService interface {
	LogDetailAkses(ctx context.Context, detailAkses entity.DetailAkses)
	GetActiveLogAksesForUser(ctx context.Context, userID int) int
	GetAllLogAkses(ctx context.Context, filter dto.LogAksesPaginationRequest) (dto.LogAksesPaginationResponse, error)
	Download(ctx context.Context, filter dto.LogAksesPaginationRequest) ([]byte, error)
}

type logAksesService struct {
	logAksesRepo repository.LogAksesRepository
}

func NewLogAksesService(logAksesRepo repository.LogAksesRepository) LogAksesService {
	return &logAksesService{logAksesRepo: logAksesRepo}
}

func (s *logAksesService) LogDetailAkses(ctx context.Context, detailAkses entity.DetailAkses) {
	s.logAksesRepo.CreateDetailAkses(ctx, nil, detailAkses)
}

func (s *logAksesService) GetActiveLogAksesForUser(ctx context.Context, userID int) int {
	return s.logAksesRepo.FindActiveLogAksesByUserID(ctx, nil, userID)
}

func (s *logAksesService) GetAllLogAkses(ctx context.Context, filter dto.LogAksesPaginationRequest) (dto.LogAksesPaginationResponse, error) {
	return s.logAksesRepo.GetAllLogAkses(ctx, filter)
}

func (s *logAksesService) Download(ctx context.Context, filter dto.LogAksesPaginationRequest) ([]byte, error) {
	filtered := dto.LogAksesPaginationRequest{
		Search:    filter.Search,
		StartDate: filter.StartDate,
		EndDate:   filter.EndDate,
	}

	logs, _ := s.logAksesRepo.GetAllLogAkses(ctx, filtered)

	f := excelize.NewFile()
	f.SetSheetName("Sheet1", "Data Log Akses")
	sheetIndex, err := f.GetSheetIndex("Data Log Akses")
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(sheetIndex)

	headers := []string{"ID", "Nama", "Email", "IP", "Aktivitas", "Token", "Payload", "Tanggal Akses"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c%d", 'A'+i, 1)
		f.SetCellValue("Data Log Akses", cell, header)
	}

	for i, log := range logs.Data {
		f.SetCellValue("Data Log Akses", fmt.Sprintf("A%d", i+2), log.ID)
		f.SetCellValue("Data Log Akses", fmt.Sprintf("B%d", i+2), log.Name)
		f.SetCellValue("Data Log Akses", fmt.Sprintf("C%d", i+2), log.Email)
		f.SetCellValue("Data Log Akses", fmt.Sprintf("D%d", i+2), log.IP)
		f.SetCellValue("Data Log Akses", fmt.Sprintf("E%d", i+2), log.Activity)
		f.SetCellValue("Data Log Akses", fmt.Sprintf("F%d", i+2), log.Token)
		f.SetCellValue("Data Log Akses", fmt.Sprintf("G%d", i+2), log.Payload)
		f.SetCellValue("Data Log Akses", fmt.Sprintf("H%d", i+2), log.Created_At)
	}

	buf := new(bytes.Buffer)
	if err := f.Write(buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil

}
