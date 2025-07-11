package repository

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"context"
	"fmt"
	"math"

	"gorm.io/gorm"
)

type PengeluaranRepository interface {
	CreatePengeluaran(ctx context.Context, pengeluaran entity.Pengeluaran) (dto.PengeluaranResponse, error)
	GetAllPengeluaranWithPagination(ctx context.Context, req dto.PaginationRequest, filter string, startDate string, endDate string) (dto.GetAllPengeluaranRepositoryResponse, error)
	GetPengeluaranByID(ctx context.Context, pengeluaranID int) (dto.PengeluaranResponse, error)
	UpdatePengeluaran(ctx context.Context, pengeluaran entity.Pengeluaran) (entity.Pengeluaran, error)
	DeletePengeluaran(ctx context.Context, pengeluaranID int) error
}

type pengeluaranRepository struct {
	db *gorm.DB
}

func NewPengeluaranRepository(db *gorm.DB) PengeluaranRepository {
	return &pengeluaranRepository{db: db}
}

func (r *pengeluaranRepository) CreatePengeluaran(ctx context.Context, pengeluaran entity.Pengeluaran) (dto.PengeluaranResponse, error) {
	err := r.db.WithContext(ctx).Create(&pengeluaran).Error
	if err != nil {
		return dto.PengeluaranResponse{}, err
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

func (r *pengeluaranRepository) GetAllPengeluaranWithPagination(ctx context.Context, req dto.PaginationRequest, filter string, startDate string, endDate string) (dto.GetAllPengeluaranRepositoryResponse, error) {

	var pengeluarans []entity.Pengeluaran
	var err error
	var count int64

	if req.PerPage == 0 {
		req.PerPage = 25
	}

	if req.Page == 0 {
		req.Page = 1
	}

	query := r.db.WithContext(ctx).Model(&entity.Pengeluaran{})

	// Apply search filter if provided
	if req.Search != "" {
		query = query.Where("nama_pengeluaran LIKE ?", "%"+req.Search+"%")
	}

	switch filter {
	case "day":
		query = query.Where("DATE(tanggal_pengeluaran) = CURRENT_DATE")
	case "month":
		query = query.Where("DATE_TRUNC('month', tanggal_pengeluaran) = DATE_TRUNC('month', CURRENT_DATE)")
	case "year":
		query = query.Where("DATE_TRUNC('year', tanggal_pengeluaran) = DATE_TRUNC('year', CURRENT_DATE)")
	}

	if startDate != "" && endDate != "" {
		startDate = startDate + " 00:00:00"
		endDate = endDate + " 23:59:59"
		query = query.Where("tanggal_pengeluaran BETWEEN ? AND ?", startDate, endDate)
	}

	fmt.Println(startDate, endDate)

	err = query.Count(&count).Error
	if err != nil {
		return dto.GetAllPengeluaranRepositoryResponse{}, err
	}

	offset := (req.Page - 1) * req.PerPage
	maxPage := int64(math.Ceil(float64(count) / float64(req.PerPage)))

	// Apply pagination and fetch results
	err = query.Order("created_at ASC").Offset(offset).Limit(req.PerPage).Find(&pengeluarans).Error
	if err != nil {
		return dto.GetAllPengeluaranRepositoryResponse{}, err
	}

	return dto.GetAllPengeluaranRepositoryResponse{
		Data: pengeluarans,
		PaginationResponse: dto.PaginationResponse{
			Page:    req.Page,
			PerPage: req.PerPage,
			MaxPage: maxPage,
			Count:   count,
		},
	}, nil
}

func (r *pengeluaranRepository) GetPengeluaranByID(ctx context.Context, pengeluaranID int) (dto.PengeluaranResponse, error) {
	var pengeluaran entity.Pengeluaran
	err := r.db.WithContext(ctx).Where("id = ?", pengeluaranID).First(&pengeluaran).Error
	if err != nil {
		return dto.PengeluaranResponse{}, err
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

func (r *pengeluaranRepository) UpdatePengeluaran(ctx context.Context, pengeluaran entity.Pengeluaran) (entity.Pengeluaran, error) {
	err := r.db.WithContext(ctx).Model(&entity.Pengeluaran{}).Where("id = ?", pengeluaran.ID).Updates(&pengeluaran).Error
	if err != nil {
		return entity.Pengeluaran{}, err
	}

	return pengeluaran, nil
}

func (r *pengeluaranRepository) DeletePengeluaran(ctx context.Context, pengeluaranID int) error {
	err := r.db.WithContext(ctx).Where("id = ?", pengeluaranID).Delete(&entity.Pengeluaran{}).Error
	if err != nil {
		return err
	}

	return nil
}
