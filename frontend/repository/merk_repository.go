package repository

import (
	"bumisubur-be/entity"
	"context"

	"gorm.io/gorm"
)

type (
	MerkRepository interface {
		CreateMerk(ctx context.Context, tx *gorm.DB, merk entity.Merk) (entity.Merk, error)
		GetAllMerk(ctx context.Context, tx *gorm.DB) ([]entity.Merk, error)
		GetMerkByID(ctx context.Context, tx *gorm.DB, merkID int) (entity.Merk, error)
		CheckMerkName(ctx context.Context, tx *gorm.DB, merkName string) (entity.Merk, bool, error)
		UpdateMerk(ctx context.Context, tx *gorm.DB, merk entity.Merk) (entity.Merk, error)
		DeleteMerk(ctx context.Context, tx *gorm.DB, merkID int) error
		GetMerkBySupplierID(ctx context.Context, tx *gorm.DB, supplierID int) ([]entity.Merk, error)
	}

	merkRepository struct {
		db *gorm.DB
	}
)

func NewMerkRepository(db *gorm.DB) MerkRepository {
	return &merkRepository{
		db: db,
	}
}
func (r *merkRepository) CreateMerk(ctx context.Context, tx *gorm.DB, merk entity.Merk) (entity.Merk, error) {
	if tx == nil {
		tx = r.db
	}

	var existingMerk entity.Merk

	if err := tx.WithContext(ctx).Where("nama = ?", merk.Nama).Take(&existingMerk).Error; err == nil {
		return existingMerk, nil
	} else if err != gorm.ErrRecordNotFound {
		return entity.Merk{}, err
	}

	if err := tx.WithContext(ctx).Create(&merk).Error; err != nil {
		return entity.Merk{}, err
	}

	return merk, nil
}

func (r *merkRepository) GetAllMerk(ctx context.Context, tx *gorm.DB) ([]entity.Merk, error) {
	if tx == nil {
		tx = r.db
	}

	var merks []entity.Merk
	if err := tx.WithContext(ctx).Distinct("nama").Find(&merks).Error; err != nil {
		return []entity.Merk{}, err
	}

	return merks, nil
}

func (r *merkRepository) GetMerkByID(ctx context.Context, tx *gorm.DB, merkID int) (entity.Merk, error) {
	if tx == nil {
		tx = r.db
	}

	var merk entity.Merk
	if err := tx.WithContext(ctx).Where("id = ?", merkID).Take(&merk).Error; err != nil {
		return entity.Merk{}, err
	}

	return merk, nil
}

func (r *merkRepository) CheckMerkName(ctx context.Context, tx *gorm.DB, merkName string) (entity.Merk, bool, error) {
	if tx == nil {
		tx = r.db
	}

	var merk entity.Merk
	if err := tx.WithContext(ctx).Where("name = ?", merkName).Take(&merk).Error; err != nil {
		return entity.Merk{}, false, nil
	}

	return merk, true, nil
}

func (r *merkRepository) UpdateMerk(ctx context.Context, tx *gorm.DB, merk entity.Merk) (entity.Merk, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Updates(&merk).Error; err != nil {
		return entity.Merk{}, err
	}

	return merk, nil
}

func (r *merkRepository) DeleteMerk(ctx context.Context, tx *gorm.DB, merkID int) error {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Delete(&entity.Merk{}, "id = ?", merkID).Error; err != nil {
		return err
	}

	return nil
}

func (r *merkRepository) GetMerkBySupplierID(ctx context.Context, tx *gorm.DB, supplierID int) ([]entity.Merk, error) {
	if tx == nil {
		tx = r.db
	}

	var merks []entity.Merk
	if err := tx.WithContext(ctx).Where("supplier_id = ?", supplierID).Find(&merks).Error; err != nil {
		return []entity.Merk{}, err
	}

	return merks, nil
}
