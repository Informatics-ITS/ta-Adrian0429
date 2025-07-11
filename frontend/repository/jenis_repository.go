package repository

import (
	"bumisubur-be/entity"
	"context"

	"gorm.io/gorm"
)

type (
	JenisRepository interface {
		CreateJenis(ctx context.Context, tx *gorm.DB, jenis entity.Jenis) (entity.Jenis, error)
		GetAllJenis(ctx context.Context, tx *gorm.DB) ([]entity.Jenis, error)
		GetJenisByID(ctx context.Context, tx *gorm.DB, jenisID int) (entity.Jenis, error)
		GetJenisByMerkID(ctx context.Context, tx *gorm.DB, merkID int) ([]entity.Jenis, error)
		CheckJenisName(ctx context.Context, tx *gorm.DB, jenisName string) (entity.Jenis, bool, error)
		UpdateJenis(ctx context.Context, tx *gorm.DB, jenis entity.Jenis) (entity.Jenis, error)
		DeleteJenis(ctx context.Context, tx *gorm.DB, jenisID int) error
	}

	jenisRepository struct {
		db *gorm.DB
	}
)

func NewJenisRepository(db *gorm.DB) JenisRepository {
	return &jenisRepository{
		db: db,
	}
}
func (r *jenisRepository) CreateJenis(ctx context.Context, tx *gorm.DB, jenis entity.Jenis) (entity.Jenis, error) {
	if tx == nil {
		tx = r.db
	}

	var existingJenis entity.Jenis
	if err := tx.WithContext(ctx).Where("nama_jenis = ?", jenis.NamaJenis).Take(&existingJenis).Error; err == nil {
		return existingJenis, nil
	} else if err != gorm.ErrRecordNotFound {
		return entity.Jenis{}, err
	}
	
	if err := tx.WithContext(ctx).Create(&jenis).Error; err != nil {
		return entity.Jenis{}, err
	}

	return jenis, nil
}

func (r *jenisRepository) GetAllJenis(ctx context.Context, tx *gorm.DB) ([]entity.Jenis, error) {
	if tx == nil {
		tx = r.db
	}

	var jeniss []entity.Jenis
	if err := tx.WithContext(ctx).Find(&jeniss).Distinct("nama_jenis").Order("created_at DESC").Error; err != nil {
		return []entity.Jenis{}, err
	}

	return jeniss, nil
}

func (r *jenisRepository) GetJenisByID(ctx context.Context, tx *gorm.DB, jenisID int) (entity.Jenis, error) {
	if tx == nil {
		tx = r.db
	}

	var jenis entity.Jenis
	if err := tx.WithContext(ctx).Where("id = ?", jenisID).Take(&jenis).Error; err != nil {
		return entity.Jenis{}, err
	}

	return jenis, nil
}

func (r *jenisRepository) GetJenisByMerkID(ctx context.Context, tx *gorm.DB, merkID int) ([]entity.Jenis, error) {
	if tx == nil {
		tx = r.db
	}

	var jeniss []entity.Jenis
	if err := tx.WithContext(ctx).Where("merk_id = ?", merkID).Find(&jeniss).Error; err != nil {
		return []entity.Jenis{}, err
	}

	return jeniss, nil
}

func (r *jenisRepository) CheckJenisName(ctx context.Context, tx *gorm.DB, jenisName string) (entity.Jenis, bool, error) {
	if tx == nil {
		tx = r.db
	}

	var jenis entity.Jenis
	if err := tx.WithContext(ctx).Where("name = ?", jenisName).Take(&jenis).Error; err != nil {
		return entity.Jenis{}, false, nil
	}

	return jenis, true, nil
}

func (r *jenisRepository) UpdateJenis(ctx context.Context, tx *gorm.DB, jenis entity.Jenis) (entity.Jenis, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Updates(&jenis).Error; err != nil {
		return entity.Jenis{}, err
	}

	return jenis, nil
}

func (r *jenisRepository) DeleteJenis(ctx context.Context, tx *gorm.DB, jenisID int) error {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Delete(&entity.Jenis{}, "id = ?", jenisID).Error; err != nil {
		return err
	}

	return nil
}
