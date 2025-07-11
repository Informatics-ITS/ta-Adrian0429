package repository

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"context"
	"math"

	"gorm.io/gorm"
)

type (
	SupplierRepository interface {
		CreateSupplier(ctx context.Context, tx *gorm.DB, supplier entity.Supplier) (entity.Supplier, error)
		GetAllSupplierWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.GetAllSupplierRepositoryResponse, error)
		GetAllSupplier(ctx context.Context, tx *gorm.DB) ([]entity.Supplier, error)
		GetSupplierByID(ctx context.Context, tx *gorm.DB, supplierID int) (entity.Supplier, error)
		CheckSupplierName(ctx context.Context, tx *gorm.DB, supplierName string) (entity.Supplier, bool, error)
		UpdateSupplier(ctx context.Context, tx *gorm.DB, supplier entity.Supplier) (entity.Supplier, error)
		DeleteSupplier(ctx context.Context, tx *gorm.DB, supplierID int) error
		CreateDetailMerkSupplier(ctx context.Context, tx *gorm.DB, detailMerkSupplier entity.DetailMerkSupplier) (entity.DetailMerkSupplier, error)
		DeleteDetailMerkSupplier(ctx context.Context, tx *gorm.DB, supplierID int) error
		GetMerksBySupplierID(ctx context.Context, tx *gorm.DB, supplierID int) ([]dto.MerkResponse, error)
	}

	supplierRepository struct {
		db *gorm.DB
	}
)

func NewSupplierRepository(db *gorm.DB) SupplierRepository {
	return &supplierRepository{
		db: db,
	}
}

func (r *supplierRepository) CreateSupplier(ctx context.Context, tx *gorm.DB, supplier entity.Supplier) (entity.Supplier, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Create(&supplier).Error; err != nil {
		return entity.Supplier{}, err
	}

	return supplier, nil
}

func (r *supplierRepository) GetAllSupplier(ctx context.Context, tx *gorm.DB) ([]entity.Supplier, error) {
	if tx == nil {
		tx = r.db
	}

	var suppliers []entity.Supplier
	if err := tx.WithContext(ctx).Find(&suppliers).Error; err != nil {
		return nil, err
	}

	return suppliers, nil

}

func (r *supplierRepository) GetAllSupplierWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.GetAllSupplierRepositoryResponse, error) {

	var suppliers []entity.Supplier
	var err error
	var count int64

	if req.PerPage == 0 {
		req.PerPage = 10
	}

	if req.Page == 0 {
		req.Page = 1
	}

	query := r.db.WithContext(ctx).Model(&entity.Supplier{}).Order("created_at ASC")
	if req.Search != "" {
		query = query.Where("name LIKE ?", "%"+req.Search+"%")
	}

	err = query.Count(&count).Error
	if err != nil {
		return dto.GetAllSupplierRepositoryResponse{}, err
	}

	offset := (req.Page - 1) * req.PerPage
	maxPage := int64(math.Ceil(float64(count) / float64(req.PerPage)))

	err = query.Offset(offset).Limit(req.PerPage).Find(&suppliers).Error
	if err != nil {
		return dto.GetAllSupplierRepositoryResponse{}, err
	}

	return dto.GetAllSupplierRepositoryResponse{
		Data: suppliers,
		PaginationResponse: dto.PaginationResponse{
			Count:   count,
			Page:    req.Page,
			PerPage: req.PerPage,
			MaxPage: maxPage,
		},
	}, nil

}

func (r *supplierRepository) GetSupplierByID(ctx context.Context, tx *gorm.DB, supplierID int) (entity.Supplier, error) {
	if tx == nil {
		tx = r.db
	}

	var supplier entity.Supplier
	if err := tx.WithContext(ctx).Where("id = ?", supplierID).Take(&supplier).Error; err != nil {
		return entity.Supplier{}, err
	}

	return supplier, nil
}

func (r *supplierRepository) CheckSupplierName(ctx context.Context, tx *gorm.DB, supplierName string) (entity.Supplier, bool, error) {
	if tx == nil {
		tx = r.db
	}

	var supplier entity.Supplier
	if err := tx.WithContext(ctx).Where("name = ?", supplierName).Take(&supplier).Error; err != nil {
		return entity.Supplier{}, false, nil
	}

	return supplier, true, nil
}

func (r *supplierRepository) UpdateSupplier(ctx context.Context, tx *gorm.DB, supplier entity.Supplier) (entity.Supplier, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Updates(&supplier).Error; err != nil {
		return entity.Supplier{}, err
	}

	return supplier, nil
}

func (r *supplierRepository) DeleteSupplier(ctx context.Context, tx *gorm.DB, supplierID int) error {
	if tx == nil {
		tx = r.db
	}

	err := tx.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Delete related DetailMerkSupplier records
		if err := tx.Delete(&entity.DetailMerkSupplier{}, "supplier_id = ?", supplierID).Error; err != nil {
			return err
		}

		if err := tx.Delete(&entity.Supplier{}, "id = ?", supplierID).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}

func (r *supplierRepository) CreateDetailMerkSupplier(ctx context.Context, tx *gorm.DB, detailMerkSupplier entity.DetailMerkSupplier) (entity.DetailMerkSupplier, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Create(&detailMerkSupplier).Error; err != nil {
		return entity.DetailMerkSupplier{}, err
	}

	return detailMerkSupplier, nil
}

func (r *supplierRepository) GetMerksBySupplierID(ctx context.Context, tx *gorm.DB, supplierID int) ([]dto.MerkResponse, error) {
	// Use tx if provided, otherwise use r.db
	if tx == nil {
		tx = r.db
	}

	// Step 1: Get all distinct Merks for the Supplier along with discounts at the DetailMerkSupplier level
	var detailMerkSuppliers []entity.DetailMerkSupplier
	if err := tx.WithContext(ctx).
		Where("supplier_id = ?", supplierID).
		Preload("Merk").
		Preload("Jenis").
		Find(&detailMerkSuppliers).Error; err != nil {
		return nil, err
	}

	// Step 2: Organize Merks and their associated Jenis with discounts
	merkMap := make(map[int]dto.MerkResponse)

	for _, detail := range detailMerkSuppliers {
		merkID := detail.MerkID
		jenis := dto.JenisResponse{
			ID:        detail.Jenis.ID,
			NamaJenis: detail.Jenis.NamaJenis,
		}

		if _, exists := merkMap[merkID]; !exists {
			// Initialize MerkResponse if not already in map
			merkMap[merkID] = dto.MerkResponse{
				NamaMerk: detail.Merk.Nama,
				Discount: detail.Discount,
				Jenis:    []dto.JenisResponse{jenis},
			}
		} else {
			// Append Jenis if Merk already exists in map
			tempMerk := merkMap[merkID]
			tempMerk.Jenis = append(tempMerk.Jenis, jenis)
			merkMap[merkID] = tempMerk
		}
	}

	// Convert merkMap to a slice of dto.MerkResponse
	merkResponses := make([]dto.MerkResponse, 0, len(merkMap))
	for _, merk := range merkMap {
		merkResponses = append(merkResponses, merk)
	}

	return merkResponses, nil
}

func (r *supplierRepository) DeleteDetailMerkSupplier(ctx context.Context, tx *gorm.DB, supplierID int) error {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Delete(&entity.DetailMerkSupplier{}, "supplier_id = ?", supplierID).Error; err != nil {
		return err
	}

	return nil
}
