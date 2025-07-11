package repository

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"context"
	"math"

	"gorm.io/gorm"
)

type (
	CabangRepository interface {
		CreateCabang(ctx context.Context, tx *gorm.DB, cabang entity.Cabang) (entity.Cabang, error)
		GetAllCabangWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.GetAllCabangRepositoryResponse, error)
		GetAllCabang(ctx context.Context, tx *gorm.DB) ([]entity.Cabang, error)
		GetCabangByID(ctx context.Context, tx *gorm.DB, cabangID int) (entity.Cabang, error)
		CheckCabangName(ctx context.Context, tx *gorm.DB, cabangName string) (entity.Cabang, bool, error)
		GetCabangByUserID(ctx context.Context, tx *gorm.DB, userID int) ([]entity.Cabang, error)
		UpdateCabang(ctx context.Context, tx *gorm.DB, cabang entity.Cabang) (entity.Cabang, error)
		DeleteCabang(ctx context.Context, tx *gorm.DB, cabangID int) error
	}

	cabangRepository struct {
		db *gorm.DB
	}
)

func NewCabangRepository(db *gorm.DB) CabangRepository {
	return &cabangRepository{
		db: db,
	}
}

func (r *cabangRepository) CreateCabang(ctx context.Context, tx *gorm.DB, cabang entity.Cabang) (entity.Cabang, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Create(&cabang).Error; err != nil {
		return entity.Cabang{}, err
	}

	return cabang, nil
}

func (r *cabangRepository) GetAllCabang(ctx context.Context, tx *gorm.DB) ([]entity.Cabang, error) {
	var cabangs []entity.Cabang
	err := r.db.WithContext(ctx).Find(&cabangs).Error
	if err != nil {
		return nil, err
	}
	return cabangs, nil
}

func (r *cabangRepository) GetAllCabangWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.GetAllCabangRepositoryResponse, error) {

	var cabangs []entity.Cabang
	var err error
	var count int64

	if req.PerPage == 0 {
		req.PerPage = 10
	}

	if req.Page == 0 {
		req.Page = 1
	}

	query := r.db.WithContext(ctx).Model(&entity.Cabang{}).Order("created_at ASC")
	if req.Search != "" {
		query = query.Where("name LIKE ?", "%"+req.Search+"%")
	}

	err = query.Count(&count).Error
	if err != nil {
		return dto.GetAllCabangRepositoryResponse{}, err
	}

	offset := (req.Page - 1) * req.PerPage
	maxPage := int64(math.Ceil(float64(count) / float64(req.PerPage)))

	err = query.Offset(offset).Limit(req.PerPage).Find(&cabangs).Error
	if err != nil {
		return dto.GetAllCabangRepositoryResponse{}, err
	}

	return dto.GetAllCabangRepositoryResponse{
		Data: cabangs,
		PaginationResponse: dto.PaginationResponse{
			Page:    req.Page,
			PerPage: req.PerPage,
			MaxPage: maxPage,
			Count:   count,
		},
	}, nil
}

func (r *cabangRepository) GetCabangByID(ctx context.Context, tx *gorm.DB, cabangID int) (entity.Cabang, error) {
	if tx == nil {
		tx = r.db
	}

	var cabang entity.Cabang
	if err := tx.WithContext(ctx).Where("id = ?", cabangID).Take(&cabang).Error; err != nil {
		return entity.Cabang{}, err
	}

	return cabang, nil
}

func (r *cabangRepository) CheckCabangName(ctx context.Context, tx *gorm.DB, cabangName string) (entity.Cabang, bool, error) {
	if tx == nil {
		tx = r.db
	}
	var cabang entity.Cabang
	if err := tx.WithContext(ctx).Where("name = ?", cabangName).Take(&cabang).Error; err != nil {
		return entity.Cabang{}, false, err
	}

	return cabang, true, nil
}

func (r *cabangRepository) UpdateCabang(ctx context.Context, tx *gorm.DB, cabang entity.Cabang) (entity.Cabang, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Updates(&cabang).Error; err != nil {
		return entity.Cabang{}, err
	}

	return cabang, nil
}

func (r *cabangRepository) DeleteCabang(ctx context.Context, tx *gorm.DB, cabangID int) error {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Delete(&entity.Cabang{}, "id = ?", cabangID).Error; err != nil {
		return err
	}

	return nil
}

func (r *cabangRepository) GetCabangByUserID(ctx context.Context, tx *gorm.DB, userID int) ([]entity.Cabang, error) {
	if tx == nil {
		tx = r.db
	}

	var cabangs []entity.Cabang
	if err := tx.WithContext(ctx).Where("user_id = ?", userID).Find(&cabangs).Error; err != nil {
		return cabangs, err
	}

	return cabangs, nil
}
