package repository

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"context"
	"database/sql"
	"fmt"
	"math"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type ProdukRepository interface {
	CreateProduk(ctx context.Context, tx *gorm.DB, produk entity.Produk) (entity.Produk, error)
	CreateDetailProduk(ctx context.Context, tx *gorm.DB, detailProduk entity.DetailProduk) (entity.DetailProduk, error)
	CreateRestok(ctx context.Context, tx *gorm.DB, restok entity.Restok) (entity.Restok, error)
	CreateDetailRestok(ctx context.Context, tx *gorm.DB, detailRestok entity.DetailRestok) (entity.DetailRestok, error)
	GetDetailMerkSupplier(ctx context.Context, tx *gorm.DB, merkId int, jenisId int, supplierId int) (entity.DetailMerkSupplier, error)
	GetAllProdukWithPagination(ctx context.Context, req dto.ProdukPaginationRequest) (dto.GetAllProdukResponse, error)

	GetDetailMerkSuppliersBySupplierID(ctx context.Context, supplierID int) ([]entity.DetailMerkSupplier, error)
	GetAllCabang(ctx context.Context, tx *gorm.DB) ([]entity.Cabang, error)
	GetRestokOldProduk(ctx context.Context) ([]dto.Produks, error)
	GetPossibleProdukSupplier(ctx context.Context, merkId int, JenisId int) ([]dto.PossibleSupplier, error)
	GetPossibleMerks(ctx context.Context, produkID int) ([]dto.PossibleMerkRepo, error)

	GetProdukByID(ctx context.Context, ProdukID int) (entity.Produk, error)
	GetProdukByBarcodeID(ctx context.Context, barcodeID string) (entity.Produk, error)
	UpdateProduk(ctx context.Context, tx *gorm.DB, produk entity.Produk) (entity.Produk, error)

	GetProdukDetails(ctx context.Context, tx *gorm.DB, produkID string) (dto.ProdukDetails, error)
	GetPendingProduks(ctx context.Context, tx *gorm.DB) ([]dto.PendingStok, error)
	GetDetailedPendingProduks(ctx context.Context, tx *gorm.DB, produkID string) (dto.PendingStok, error)
	DeleteDetailedPendingProduks(ctx context.Context, tx *gorm.DB, produkID string) error

	// GetAllRestokWithPagination(ctx context.Context, req dto.RestokProdukPaginationRequest) (dto.RestokProdukPaginationResponse, error)
	GetAllRestok(ctx context.Context, tx *gorm.DB, startDate, endDate, order string) ([]dto.RestokDTO, error)
	GetAllRestokDetails(ctx context.Context, tx *gorm.DB, restokID int) ([]dto.DetailRestok, error)

	GetFinalStok(ctx context.Context, filter dto.FilterFinalStok) ([]dto.FinalStokResponse, error)
	GetFinalStokProduk(ctx context.Context) ([]dto.FinalStokProdukResponse, error)
	GetFinalStokJenis(ctx context.Context) ([]dto.FinalStokJenisResponse, error)
	GetFinalStokMerk(ctx context.Context) ([]dto.FinalStokMerk, error)
	InsertProduk(ctx context.Context, tx *gorm.DB, restokID string) (entity.Produk, error)
	DeleteDetailPendingOnly(ctx context.Context, tx *gorm.DB, restokID int64) error

	GetReturnRestok(ctx context.Context, tx *gorm.DB, restokID string) (dto.PendingStok, error)
}

type produkRepository struct {
	db *gorm.DB
}

func NewProdukRepository(db *gorm.DB) ProdukRepository {
	return &produkRepository{db: db}
}

func (r *produkRepository) CreateProduk(ctx context.Context, tx *gorm.DB, produk entity.Produk) (entity.Produk, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Create(&produk).Error; err != nil {
		return entity.Produk{}, err
	}

	return produk, nil
}

func (r *produkRepository) GetProdukByBarcodeID(ctx context.Context, barcodeID string) (entity.Produk, error) {
	var produk entity.Produk
	if err := r.db.WithContext(ctx).Where("barcode_id = ?", barcodeID).Take(&produk).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return entity.Produk{}, nil
		}
		return entity.Produk{}, err
	}
	return produk, nil
}

func (r *produkRepository) UpdateProduk(ctx context.Context, tx *gorm.DB, produk entity.Produk) (entity.Produk, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Save(&produk).Error; err != nil {
		return entity.Produk{}, err
	}

	return produk, nil
}

func (r *produkRepository) CreateDetailProduk(ctx context.Context, tx *gorm.DB, detailProduk entity.DetailProduk) (entity.DetailProduk, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Create(&detailProduk).Error; err != nil {
		return entity.DetailProduk{}, err
	}
	return detailProduk, nil
}

func (r *produkRepository) GetAllCabang(ctx context.Context, tx *gorm.DB) ([]entity.Cabang, error) {
	if tx == nil {
		tx = r.db
	}

	var cabangs []entity.Cabang
	if err := tx.WithContext(ctx).Find(&cabangs).Error; err != nil {
		return nil, err
	}
	return cabangs, nil
}

func (r *produkRepository) GetDetailMerkSuppliersBySupplierID(ctx context.Context, supplierID int) ([]entity.DetailMerkSupplier, error) {
	var detailMerkSuppliers []entity.DetailMerkSupplier
	if err := r.db.WithContext(ctx).Where("supplier_id = ?", supplierID).Find(&detailMerkSuppliers).Error; err != nil {
		return nil, err
	}
	return detailMerkSuppliers, nil
}

func (r *produkRepository) GetDetailMerkSupplier(ctx context.Context, tx *gorm.DB, merkId int, jenisId int, supplierId int) (entity.DetailMerkSupplier, error) {
	if tx == nil {
		tx = r.db
	}

	var detailMerkSupplier entity.DetailMerkSupplier
	if err := tx.WithContext(ctx).Where("merk_id = ? AND jenis_id = ? AND supplier_id = ?", merkId, jenisId, supplierId).Take(&detailMerkSupplier).Error; err != nil {
		return entity.DetailMerkSupplier{}, err
	}

	return detailMerkSupplier, nil
}

func (r *produkRepository) CreateRestok(ctx context.Context, tx *gorm.DB, restok entity.Restok) (entity.Restok, error) {
	if tx == nil {
		tx = r.db
	}

	// Generate Restok ID with format YYYYMMDDXXXX
	today := time.Now().Format("20060102") // Format as YYYYMMDD

	// Get the latest Restok ID for today
	latestID, err := r.GetLatestRestokID(ctx, today)
	if err != nil {
		return entity.Restok{}, err
	}

	// Determine the sequence number
	sequence := 1
	if latestID != 0 {
		sequence = int(latestID%10000) + 1 // Extract sequence part and increment
	}

	// Create the new Restok ID as int64
	datePrefix, _ := strconv.ParseInt(today, 10, 64)
	restok.ID = datePrefix*10000 + int64(sequence)

	// Insert into database
	if err := tx.WithContext(ctx).Create(&restok).Error; err != nil {
		return entity.Restok{}, err
	}

	return restok, nil
}

func (r *produkRepository) GetLatestRestokID(ctx context.Context, date string) (int64, error) {
	var latestID int64
	err := r.db.WithContext(ctx).
		Table("restoks").
		Select("id").
		Where("id BETWEEN ? AND ?", date+"0000", date+"9999").
		Order("id DESC").
		Limit(1).
		Row().
		Scan(&latestID)

	if err != nil {
		if err == gorm.ErrRecordNotFound || err == sql.ErrNoRows {
			// No records found, return 0
			return 0, nil
		}
		return 0, err
	}

	return latestID, nil
}

func (r *produkRepository) GetProdukSizes(ctx context.Context, tx *gorm.DB, produkID int) ([]dto.ProdukSizes, error) {
	if tx == nil {
		tx = r.db
	}

	var produkSizes []dto.ProdukSizes
	if err := tx.WithContext(ctx).
		Raw(`
			SELECT ukuran
			FROM (
				SELECT DISTINCT ukuran
				FROM detail_produks
				WHERE produk_id = ? AND status = 1
			) AS distinct_sizes
			ORDER BY 
				CASE 
					WHEN ukuran = 'XS' THEN 1
					WHEN ukuran = 'S' THEN 2
					WHEN ukuran = 'M' THEN 3
					WHEN ukuran = 'L' THEN 4
					WHEN ukuran = 'XL' THEN 5
					WHEN ukuran = 'XXL' THEN 6
					ELSE 7
				END
		`, produkID).
		Scan(&produkSizes).Error; err != nil {
		return nil, err
	}
	return produkSizes, nil
}

func (r *produkRepository) GetAllProdukDetails(ctx context.Context, tx *gorm.DB, produkID int) ([]dto.Details, error) {
	if tx == nil {
		tx = r.db
	}

	var produkDetails []dto.Details
	if err := tx.WithContext(ctx).
		Table("detail_produks a").
		Select("a.id AS detail_id, a.warna, a.stok, r.tanggal_restok, a.ukuran AS ukuran").
		Joins("JOIN detail_merk_suppliers b ON a.detail_merk_supplier_id = b.detail_merk_supplier_id").
		Joins("LEFT JOIN detail_restoks dr ON a.id = dr.detail_produk_id").
		Joins("LEFT JOIN restoks r ON dr.restok_id = r.id").
		Where("a.produk_id = ? AND a.status = 1", produkID).
		Order(`
			CASE 
				WHEN a.ukuran = 'XS' THEN 1
				WHEN a.ukuran = 'S' THEN 2
				WHEN a.ukuran = 'M' THEN 3
				WHEN a.ukuran = 'L' THEN 4
				WHEN a.ukuran = 'XL' THEN 5
				WHEN a.ukuran = 'XXL' THEN 6
				ELSE 7
			END
		`).
		Scan(&produkDetails).Error; err != nil {
		return nil, err
	}

	return produkDetails, nil
}

func (r *produkRepository) DeleteDetailPendingOnly(ctx context.Context, tx *gorm.DB, restokID int64) error {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).
		Table("detail_produks dp").
		Where("dp.id IN (SELECT dr.detail_produk_id FROM detail_restoks dr WHERE dr.restok_id = ?) AND dp.status = 0", restokID).
		Delete(nil).Error; err != nil {
		return err
	}

	if err := tx.WithContext(ctx).
		Table("detail_restoks").
		Where("restok_id = ?", restokID).
		Delete(nil).Error; err != nil {
		return err
	}

	return nil
}

func (r *produkRepository) DeleteDetailedPendingProduks(ctx context.Context, tx *gorm.DB, restokID string) error {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).
		Table("detail_produks dp").
		Where("dp.id IN (SELECT dr.detail_produk_id FROM detail_restoks dr WHERE dr.restok_id = ?) AND dp.status = 0", restokID).
		Delete(nil).Error; err != nil {
		return err
	}

	if err := tx.WithContext(ctx).
		Table("detail_restoks").
		Where("restok_id = ?", restokID).
		Delete(nil).Error; err != nil {
		return err
	}

	if err := tx.WithContext(ctx).
		Table("restoks").
		Where("id = ?", restokID).
		Delete(nil).Error; err != nil {
		return err
	}

	return nil
}

func (r *produkRepository) GetAllProdukWithPagination(ctx context.Context, req dto.ProdukPaginationRequest) (dto.GetAllProdukResponse, error) {
	var err error
	var count int64

	if req.PerPage == 0 {
		req.PerPage = 20
	}

	if req.Page == 0 {
		req.Page = 1
	}

	queryCount := r.db.WithContext(ctx).Table("produks").Limit(req.PerPage)
	if req.Search != "" {
		queryCount = queryCount.Where("nama_produk LIKE ?", "%"+req.Search+"%")
	}

	err = queryCount.Count(&count).Error
	if err != nil {
		return dto.GetAllProdukResponse{}, err
	}

	var produkList []dto.GetAllProduk
	orderBy := "a.id"
	if req.Order == "barcode" {
		orderBy = "a.barcode_id"
	} else if req.Order == "name" {
		orderBy = "a.nama_produk"
	}

	query := r.db.WithContext(ctx).
		Table("produks a").
		Select("DISTINCT a.id AS produk_id, a.nama_produk, a.barcode_id, a.harga_jual, b.name AS nama_cabang, e.nama as merk, f.nama_jenis as jenis").
		Joins("JOIN cabangs b ON a.cabang_id = b.id").
		Joins("JOIN detail_produks c ON a.id = c.produk_id").
		Joins("JOIN detail_merk_suppliers d ON c.detail_merk_supplier_id = d.detail_merk_supplier_id").
		Joins("JOIN merks e ON d.merk_id = e.id").
		Joins("JOIN jenis f ON d.jenis_id = f.id").
		Order(orderBy + " ASC").
		Limit(req.PerPage)

	if req.Search != "" {
		query = query.Where("a.nama_produk LIKE ?", "%"+req.Search+"%")
	}

	offset := (req.Page - 1) * req.PerPage
	maxPage := int64(math.Ceil(float64(count) / float64(req.PerPage)))

	var tempProdukList []dto.RepoQueryProdukCabang
	err = query.Offset(offset).Limit(req.PerPage).Find(&tempProdukList).Error
	if err != nil {
		return dto.GetAllProdukResponse{}, err
	}

	produkMap := make(map[int]*dto.GetAllProduk)

	for _, produk := range tempProdukList {
		if _, exists := produkMap[produk.ProdukID]; !exists {
			produkMap[produk.ProdukID] = &dto.GetAllProduk{
				ID:         produk.ProdukID,
				NamaProduk: produk.NamaProduk,
				BarcodeID:  produk.BarcodeID,
				HargaJual:  produk.HargaJual,
				CV:         produk.NamaCabang,
				Merk:       produk.Merk,
				Jenis:      produk.Jenis,
				Details:    []dto.Details{},
			}
		}
		currentProduk := produkMap[produk.ProdukID]

		// produkSizes, err := r.GetProdukSizes(ctx, nil, produk.ProdukID)
		// if err != nil {
		// 	return dto.GetAllProdukResponse{}, err
		// }

		// for _, size := range produkSizes {
		produkDetails, err := r.GetAllProdukDetails(ctx, nil, produk.ProdukID)
		if err != nil {
			return dto.GetAllProdukResponse{}, err
		}

		currentProduk.Details = append(currentProduk.Details, produkDetails...)
		// }
	}

	for _, produk := range produkMap {
		produkList = append(produkList, *produk)
	}

	return dto.GetAllProdukResponse{
		Data: produkList,
		ProdukPaginationResponse: dto.ProdukPaginationResponse{
			MaxPage: maxPage,
			Count:   count,
			PerPage: req.PerPage,
			Page:    req.Page,
		},
	}, nil
}

func (r *produkRepository) GetRestokOldProduk(ctx context.Context) ([]dto.Produks, error) {
	var res []dto.Produks

	query := `
	SELECT DISTINCT
			a.id AS produk_id,
			a.barcode_id AS barcode_id,
			a.nama_produk AS produk, 
			c.merk_id AS merk_id, 
			e.nama AS merk, 
			c.jenis_id AS jenis_id, 
			d.nama_jenis AS jenis, 
			f.id AS cabang_id, 
			f.name AS cabang,
			c.supplier_id AS supplier_id,
			c.discount AS diskon,
			a.harga_jual AS harga_jual
		FROM 
			produks a 
		JOIN 
			detail_produks b ON a.id = b.produk_id 
		JOIN 
			cabangs f ON a.cabang_id = f.id
		JOIN 
			detail_merk_suppliers c ON c.detail_merk_supplier_id = b.detail_merk_supplier_id 
		JOIN 
			jenis d ON c.jenis_id = d.id 
		JOIN 
			merks e ON c.merk_id = e.id
	`

	err := r.db.WithContext(ctx).Raw(query).Scan(&res).Error
	if err != nil {
		return []dto.Produks{}, err
	}

	return res, nil
}

func (r *produkRepository) GetProdukByID(ctx context.Context, ProdukID int) (entity.Produk, error) {
	var produk entity.Produk
	if err := r.db.WithContext(ctx).Where("id = ?", ProdukID).Take(&produk).Error; err != nil {
		return entity.Produk{}, err
	}
	return produk, nil
}

func (r *produkRepository) GetPossibleProdukSupplier(ctx context.Context, merkId int, JenisId int) ([]dto.PossibleSupplier, error) {
	var res []dto.PossibleSupplier

	query := `select a.id AS supplier_id, a.name AS supplier from suppliers a join detail_merk_suppliers b on a.id = b.supplier_id where merk_id = ? and b.jenis_id = ?`

	err := r.db.WithContext(ctx).Raw(query, merkId, JenisId).Scan(&res).Error
	if err != nil {
		return []dto.PossibleSupplier{}, err
	}

	return res, nil
}

func (r *produkRepository) GetPossibleMerks(ctx context.Context, produkID int) ([]dto.PossibleMerkRepo, error) {
	var merks []dto.PossibleMerkRepo

	query := `
		SELECT DISTINCT 
			m.id AS merk_id, 
			m.nama AS merk
		FROM detail_produks dp
		JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id
		JOIN merks m ON dms.merk_id = m.id
		WHERE dp.produk_id = ?
	`
	if err := r.db.WithContext(ctx).Raw(query, produkID).Scan(&merks).Error; err != nil {
		return nil, err
	}

	return merks, nil
}

func (r *produkRepository) GetProdukDetails(ctx context.Context, tx *gorm.DB, produkID string) (dto.ProdukDetails, error) {
	if tx == nil {
		tx = r.db
	}

	var produkData struct {
		ID           int     `json:"id"`
		Barcode      string  `json:"barcode"`
		NamaProduk   string  `json:"nama_produk"`
		MerkID       int     `json:"merk_id"`
		Merk         string  `json:"merk"`
		JenisID      int     `json:"jenis_id"`
		Jenis        string  `json:"jenis"`
		HargaBeli    float64 `json:"harga_beli"`
		HargaJual    float64 `json:"harga_jual"`
		CVID         int     `json:"cv_id"`
		CV           string  `json:"cv"`
		SupplierID   int     `json:"supplier_id"`
		SupplierName string  `json:"supplier_name"`
	}

	if err := tx.WithContext(ctx).
		Table("produks a").
		Select("a.id, a.barcode_id AS barcode, a.nama_produk, b.harga_beli, a.harga_jual, d.id as cv_id, d.name AS cv, e.id as merk_id, e.nama AS merk, f.id as jenis_id, f.nama_jenis AS jenis, c.supplier_id as supplier_id, g.name as supplier_name").
		Joins("JOIN detail_produks b ON a.id = b.produk_id").
		Joins("JOIN detail_merk_suppliers c ON c.detail_merk_supplier_id = b.detail_merk_supplier_id").
		Joins("JOIN cabangs d ON a.cabang_id = d.id").
		Joins("JOIN merks e ON c.merk_id = e.id").
		Joins("JOIN jenis f ON c.jenis_id = f.id").
		Joins("JOIN suppliers g ON c.supplier_id = g.id").
		Where("a.id = ?", produkID).
		First(&produkData).Error; err != nil {
		return dto.ProdukDetails{}, err
	}

	produk := dto.ProdukDetails{
		ID:           produkData.ID,
		Barcode:      produkData.Barcode,
		NamaProduk:   produkData.NamaProduk,
		MerkID:       produkData.MerkID,
		Merk:         produkData.Merk,
		JenisID:      produkData.JenisID,
		Jenis:        produkData.Jenis,
		HargaBeli:    produkData.HargaBeli,
		HargaJual:    produkData.HargaJual,
		CVID:         produkData.CVID,
		CV:           produkData.CV,
		SupplierID:   produkData.SupplierID,
		SupplierName: produkData.SupplierName,
		Stoks:        []dto.StokBarang{},
	}

	var stokDetails []dto.StokBarang
	if err := tx.WithContext(ctx).
		Table("detail_produks a").
		Select("a.ukuran, a.warna, a.stok, a.harga_beli, r.tanggal_restok").
		Joins("LEFT JOIN detail_restoks dr ON a.id = dr.detail_produk_id").
		Joins("LEFT JOIN restoks r ON dr.restok_id = r.id").
		Where("a.produk_id = ? AND a.status = 1", produkID).
		Scan(&stokDetails).Error; err != nil {
		return dto.ProdukDetails{}, err
	}

	produk.Stoks = stokDetails

	return produk, nil
}

func (r *produkRepository) CreateDetailRestok(ctx context.Context, tx *gorm.DB, detailRestok entity.DetailRestok) (entity.DetailRestok, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Create(&detailRestok).Error; err != nil {
		return entity.DetailRestok{}, err
	}

	return detailRestok, nil
}

func (r *produkRepository) GetPendingProduks(ctx context.Context, tx *gorm.DB) ([]dto.PendingStok, error) {
	if tx == nil {
		tx = r.db
	}

	var produkData []struct {
		RestokID   int64   `json:"restok_id"`
		ID         int     `json:"id"`
		Barcode    string  `json:"barcode"`
		NamaProduk string  `json:"nama_produk"`
		Merk       string  `json:"merk"`
		Jenis      string  `json:"jenis"`
		CV         string  `json:"cv"`
		HargaJual  float64 `json:"harga_jual"`
	}

	if err := tx.WithContext(ctx).
		Table("restoks r").
		Select("DISTINCT r.id as restok_id, p.id, p.barcode_id as barcode, p.nama_produk, m.nama as merk, j.nama_jenis as jenis, c.name as cv, p.harga_jual").
		Joins("JOIN detail_restoks dr ON r.id = dr.restok_id").
		Joins("JOIN detail_produks dp ON dr.detail_produk_id = dp.id").
		Joins("JOIN produks p ON dp.produk_id = p.id").
		Joins("JOIN detail_merk_suppliers dms ON dms.detail_merk_supplier_id = dp.detail_merk_supplier_id").
		Joins("JOIN merks m ON dms.merk_id = m.id").
		Joins("JOIN jenis j ON dms.jenis_id = j.id").
		Joins("JOIN cabangs c ON p.cabang_id = c.id").
		Where("dp.status = 0").
		Scan(&produkData).Error; err != nil {
		return nil, err
	}

	var result []dto.PendingStok

	for _, produk := range produkData {
		var stokDetails []dto.StokBarang

		if err := tx.WithContext(ctx).
			Table("detail_produks dp").
			Select("dp.ukuran, dp.warna, dp.stok, r.tanggal_restok").
			Joins("LEFT JOIN detail_restoks dr ON dp.id = dr.detail_produk_id").
			Joins("LEFT JOIN restoks r ON dr.restok_id = r.id").
			Where("r.id = ? AND dp.status = 0", produk.RestokID).
			Scan(&stokDetails).Error; err != nil {
			return nil, err
		}

		result = append(result, dto.PendingStok{
			RestokID:   produk.RestokID,
			ID:         produk.ID,
			Barcode:    produk.Barcode,
			NamaProduk: produk.NamaProduk,
			Merk:       produk.Merk,
			Jenis:      produk.Jenis,
			CV:         produk.CV,
			HargaJual:  produk.HargaJual,
			Stoks:      stokDetails,
		})
	}

	return result, nil
}

func (r *produkRepository) GetDetailedPendingProduks(ctx context.Context, tx *gorm.DB, restokID string) (dto.PendingStok, error) {
	if tx == nil {
		tx = r.db
	}

	var produkData struct {
		RestokID   int64   `json:"restok_id"`
		ID         int     `json:"id"`
		Barcode    string  `json:"barcode"`
		NamaProduk string  `json:"nama_produk"`
		Merk       string  `json:"merk"`
		Jenis      string  `json:"jenis"`
		CV         string  `json:"cv"`
		Supplier   string  `json:"supplier"`
		HargaJual  float64 `json:"harga_jual"`
	}

	if err := tx.WithContext(ctx).
		Table("restoks r").
		Select("DISTINCT r.id as restok_id, p.id, p.barcode_id as barcode, p.nama_produk, m.nama as merk, j.nama_jenis as jenis, c.name as cv, s.name as supplier, p.harga_jual").
		Joins("JOIN detail_restoks dr ON r.id = dr.restok_id").
		Joins("JOIN detail_produks dp ON dr.detail_produk_id = dp.id").
		Joins("JOIN produks p ON dp.produk_id = p.id").
		Joins("JOIN detail_merk_suppliers dms ON dms.detail_merk_supplier_id = dp.detail_merk_supplier_id").
		Joins("JOIN merks m ON dms.merk_id = m.id").
		Joins("JOIN jenis j ON dms.jenis_id = j.id").
		Joins("JOIN cabangs c ON p.cabang_id = c.id").
		Joins("JOIN suppliers s ON dms.supplier_id = s.id").
		Where("r.id = ?", restokID).
		First(&produkData).Error; err != nil {
		return dto.PendingStok{}, err
	}

	var result dto.PendingStok

	var stokDetails []dto.StokBarang

	if err := tx.WithContext(ctx).
		Table("detail_produks dp").
		Select("dp.ukuran, dp.warna, dp.stok, r.tanggal_restok").
		Joins("LEFT JOIN detail_restoks dr ON dp.id = dr.detail_produk_id").
		Joins("LEFT JOIN restoks r ON dr.restok_id = r.id").
		Where("r.id = ? AND dp.status = 0", restokID).
		Scan(&stokDetails).Error; err != nil {
		return dto.PendingStok{}, err
	}

	result = dto.PendingStok{
		ID:         produkData.ID,
		RestokID:   produkData.RestokID,
		Barcode:    produkData.Barcode,
		NamaProduk: produkData.NamaProduk,
		Merk:       produkData.Merk,
		Jenis:      produkData.Jenis,
		CV:         produkData.CV,
		Supplier:   produkData.Supplier,
		HargaJual:  produkData.HargaJual,
		Stoks:      stokDetails,
	}

	return result, nil
}

func (r *produkRepository) GetReturnRestok(ctx context.Context, tx *gorm.DB, restokID string) (dto.PendingStok, error) {
	if tx == nil {
		tx = r.db
	}

	var produkData struct {
		RestokID   int64   `json:"restok_id"`
		ID         int     `json:"id"`
		Barcode    string  `json:"barcode"`
		NamaProduk string  `json:"nama_produk"`
		Merk       string  `json:"merk"`
		Jenis      string  `json:"jenis"`
		CV         string  `json:"cv"`
		Supplier   string  `json:"supplier"`
		HargaJual  float64 `json:"harga_jual"`
	}

	if err := tx.WithContext(ctx).
		Table("restoks r").
		Select("DISTINCT r.id as restok_id, p.id, p.barcode_id as barcode, p.nama_produk, m.nama as merk, j.nama_jenis as jenis, c.name as cv, s.name as supplier, p.harga_jual").
		Joins("JOIN detail_restoks dr ON r.id = dr.restok_id").
		Joins("JOIN detail_produks dp ON dr.detail_produk_id = dp.id").
		Joins("JOIN produks p ON dp.produk_id = p.id").
		Joins("JOIN detail_merk_suppliers dms ON dms.detail_merk_supplier_id = dp.detail_merk_supplier_id").
		Joins("JOIN merks m ON dms.merk_id = m.id").
		Joins("JOIN jenis j ON dms.jenis_id = j.id").
		Joins("JOIN cabangs c ON p.cabang_id = c.id").
		Joins("JOIN suppliers s ON dms.supplier_id = s.id").
		Where("r.id = ?", restokID).
		First(&produkData).Error; err != nil {
		return dto.PendingStok{}, err
	}

	var result dto.PendingStok

	var stokDetails []dto.StokBarang

	if err := tx.WithContext(ctx).
		Table("detail_produks dp").
		Select("dp.ukuran, dp.warna, dp.stok, r.tanggal_restok").
		Joins("LEFT JOIN detail_restoks dr ON dp.id = dr.detail_produk_id").
		Joins("LEFT JOIN restoks r ON dr.restok_id = r.id").
		Where("r.id = ?", restokID).
		Scan(&stokDetails).Error; err != nil {
		return dto.PendingStok{}, err
	}

	result = dto.PendingStok{
		ID:         produkData.ID,
		RestokID:   produkData.RestokID,
		Barcode:    produkData.Barcode,
		NamaProduk: produkData.NamaProduk,
		Merk:       produkData.Merk,
		Jenis:      produkData.Jenis,
		CV:         produkData.CV,
		Supplier:   produkData.Supplier,
		HargaJual:  produkData.HargaJual,
		Stoks:      stokDetails,
	}

	return result, nil
}

func (r *produkRepository) InsertProduk(ctx context.Context, tx *gorm.DB, restokID string) (entity.Produk, error) {

	if tx == nil {
		tx = r.db
	}

	var ids []int

	if err := tx.WithContext(ctx).
		Table("restoks r").
		Select("dr.detail_produk_id").
		Joins("JOIN detail_restoks dr ON r.id = dr.restok_id").
		Where("r.id = ?", restokID).
		Scan(&ids).Error; err != nil {
		return entity.Produk{}, err
	}

	if err := tx.WithContext(ctx).
		Table("detail_produks").
		Where("id IN ?", ids).
		Update("status", 1).Error; err != nil {
		return entity.Produk{}, err
	}

	var produk entity.Produk
	if err := tx.WithContext(ctx).
		Table("produks p").
		Select("p.id, p.nama_produk, p.barcode_id, p.harga_jual").
		Joins("JOIN detail_produks dp ON p.id = dp.produk_id").
		Where("dp.id IN ?", ids).
		First(&produk).Error; err != nil {
		return entity.Produk{}, err
	}

	return produk, nil
}

func (r *produkRepository) GetAllRestok(ctx context.Context, tx *gorm.DB, startDate, endDate, order string) ([]dto.RestokDTO, error) {
	var restokDTOs []dto.RestokDTO

	db := r.db
	if tx != nil {
		db = tx
	}

	query := `
		SELECT DISTINCT r.id, p.nama_produk, m.nama AS merk, s.name AS supplier_name, r.tanggal_restok 
		FROM restoks r
		JOIN produks p ON r.produk_id = p.id
		JOIN detail_produks dp ON p.id = dp.produk_id
		JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id
		JOIN merks m ON dms.merk_id = m.id
		JOIN suppliers s ON r.supplier_id = s.id
		WHERE r.tanggal_restok BETWEEN ? AND ?
		ORDER BY r.tanggal_restok %s
	`

	orderDirection := "ASC"
	if order == "desc" || order == "DESC" {
		orderDirection = "DESC"
	}

	query = fmt.Sprintf(query, orderDirection)

	if err := db.WithContext(ctx).Raw(query, startDate, endDate).Scan(&restokDTOs).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch restok summary: %w", err)
	}

	return restokDTOs, nil
}

func (r *produkRepository) GetAllRestokDetails(ctx context.Context, tx *gorm.DB, restokID int) ([]dto.DetailRestok, error) {
	if tx == nil {
		tx = r.db
	}

	var restokDetails []dto.DetailRestok
	if err := tx.WithContext(ctx).
		Table("detail_restoks dr").
		Select("dr.jumlah, dp.ukuran, dp.warna").
		Joins("JOIN detail_produks dp ON dr.detail_produk_id = dp.id").
		Where("dr.restok_id = ?", restokID).
		Scan(&restokDetails).Error; err != nil {
		return nil, err
	}
	return restokDetails, nil
}

func (r *produkRepository) GetFinalStok(ctx context.Context, filter dto.FilterFinalStok) ([]dto.FinalStokResponse, error) {
	var results []dto.FinalStokResponse

	query := r.db.WithContext(ctx).
		Table("produks p").
		Select("p.id as produk_id, p.nama_produk, p.barcode_id, m.id as merk_id, m.nama as merk_nama, j.nama_jenis, dp.stok, dp.ukuran, dp.warna, p.harga_jual, (dp.stok * p.harga_jual) as total_notional").
		Joins("JOIN detail_produks dp ON p.id = dp.produk_id").
		Joins("JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id").
		Joins("JOIN merks m ON dms.merk_id = m.id").
		Joins("JOIN jenis j ON dms.jenis_id = j.id").
		Order("m.id, p.id")

	if filter.StartDate != "" && filter.EndDate != "" {
		query = query.Where("p.created_at BETWEEN ? AND ?", filter.StartDate, filter.EndDate)
	}

	if filter.Merk != "" {
		query = query.Where("m.nama = ?", filter.Merk)
	}

	if filter.Jenis != "" {
		query = query.Where("j.nama_jenis = ?", filter.Jenis)
	}

	if err := query.Scan(&results).Error; err != nil {
		return nil, err
	}

	return results, nil
}

func (r *produkRepository) GetFinalStokProduk(ctx context.Context) ([]dto.FinalStokProdukResponse, error) {
	// Step 1: Get all merks
	merks, err := getAllMerks(r.db)
	if err != nil {
		return nil, err
	}

	var responses []dto.FinalStokProdukResponse

	// Step 2: Iterate through each merk
	for _, merk := range merks {
		// Create the response entry for the merk
		merkResponse := dto.FinalStokProdukResponse{
			Merk: merk.Nama,
		}

		// Step 3: Get all jenis for the current merk
		jenisList, err := getJenisByMerk(r.db, merk.ID)
		if err != nil {
			return nil, err
		}

		// Step 4: Populate data for each jenis
		for _, jenisName := range jenisList {
			var jenisID int
			r.db.Table("jenis").Select("id").Where("nama_jenis = ?", jenisName).Scan(&jenisID)

			jenisResponse := dto.FinalStokProdukDetailJenis{
				Jenis: jenisName,
			}

			// Step 5: Get all produk for the current merk and jenis
			produkDetails, err := getProdukDetailsByMerkAndJenis(r.db, merk.ID, jenisID)
			if err != nil {
				return nil, err
			}

			// Step 6: Group produk details by produk name
			produkMap := make(map[string][]dto.FinalStokProdukDetail)
			for _, detail := range produkDetails {
				produkMap[detail.Produk] = append(produkMap[detail.Produk], dto.FinalStokProdukDetail{
					Ukuran:        detail.Ukuran,
					Stok:          detail.Stok,
					HargaJual:     detail.HargaJual,
					TotalNotional: detail.TotalNotional,
				})
			}

			// Step 7: Transform the produkMap into ProdukDetail slices
			for produkName, details := range produkMap {
				// Calculate the sum of TotalNotional for the current produk
				var sumTotalNotional float64
				for _, detail := range details {
					sumTotalNotional += detail.TotalNotional
				}

				// Append the produk detail to the jenisResponse
				jenisResponse.Produk = append(jenisResponse.Produk, dto.FinalStokProdukProdukDetail{
					Produk:           produkName,
					Detail:           details,
					SumTotalNotional: sumTotalNotional,
				})
			}

			// Add the jenis response to the merk response
			merkResponse.Jenis = append(merkResponse.Jenis, jenisResponse)
		}

		// Add the completed merk response to the final responses
		responses = append(responses, merkResponse)
	}

	return responses, nil
}

func getAllMerks(db *gorm.DB) ([]dto.FinalGetAllMerk, error) {
	var merks []dto.FinalGetAllMerk
	err := db.Table("merks").Select("id, nama").Find(&merks).Error
	return merks, err
}

func getJenisByMerk(db *gorm.DB, merkID int) ([]string, error) {
	var jenis []string
	err := db.Table("jenis j").
		Select("j.nama_jenis").
		Joins("JOIN detail_merk_suppliers dms ON j.id = dms.jenis_id").
		Where("dms.merk_id = ?", merkID).
		Find(&jenis).Error
	return jenis, err
}

func getProdukDetailsByMerkAndJenis(db *gorm.DB, merkID int, jenisID int) ([]dto.FinalGetProdukDetail, error) {
	var details []dto.FinalGetProdukDetail
	err := db.Table("produks p").
		Select("p.nama_produk AS produk, dp.ukuran, dp.stok, p.harga_jual, (dp.stok * p.harga_jual) AS total_notional").
		Joins("JOIN detail_produks dp ON p.id = dp.produk_id").
		Joins("JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id").
		Where("dms.merk_id = ? AND dms.jenis_id = ?", merkID, jenisID).
		Find(&details).Error
	return details, err
}

func (r *produkRepository) GetFinalStokJenis(ctx context.Context) ([]dto.FinalStokJenisResponse, error) {
	// Step 1: Get all merks
	merks, err := getAllMerks(r.db)
	if err != nil {
		return nil, err
	}

	var responses []dto.FinalStokJenisResponse

	// Step 2: Iterate through each merk
	for _, merk := range merks {
		// Create the response entry for the merk
		merkResponse := dto.FinalStokJenisResponse{
			Merk: merk.Nama,
		}

		// Step 3: Get all jenis details for the current merk
		jenisDetails, err := getJenisDetailsByMerk(r.db, merk.ID)
		if err != nil {
			return nil, err
		}

		// Step 4: Group data by jenis
		jenisMap := make(map[string]map[string][]dto.FinalStokJenisDetailResponse)

		for _, detail := range jenisDetails {
			if _, exists := jenisMap[detail.Jenis]; !exists {
				jenisMap[detail.Jenis] = make(map[string][]dto.FinalStokJenisDetailResponse)
			}
			jenisMap[detail.Jenis][detail.Ukuran] = append(jenisMap[detail.Jenis][detail.Ukuran], dto.FinalStokJenisDetailResponse{
				Jumlah:        detail.Jumlah,
				HargaJual:     detail.HargaJual,
				TotalNotional: detail.TotalNotional,
			})
		}

		// Step 5: Transform the grouped data into the desired structure
		for jenisName, ukuranMap := range jenisMap {
			jenisResponse := dto.FinalStokJenisJenisDetailResponse{
				Jenis: jenisName,
			}

			var sumTotalNotional float64 // Initialize the sum for the current jenis

			for ukuranName, details := range ukuranMap {
				// Calculate the sum of TotalNotional for this ukuran
				for _, detail := range details {
					sumTotalNotional += detail.TotalNotional
				}

				jenisResponse.Ukuran = append(jenisResponse.Ukuran, dto.FinalStokJenisUkuranRespone{
					Ukuran: ukuranName,
					Detail: details,
				})
			}

			// Add the calculated sumTotalNotional to the jenis response
			jenisResponse.SumTotalNotional = sumTotalNotional

			// Append the jenis response to the merk response
			merkResponse.Jenis = append(merkResponse.Jenis, jenisResponse)
		}

		// Add the completed merk response to the final responses
		responses = append(responses, merkResponse)
	}

	return responses, nil
}

func (r *produkRepository) GetFinalStokMerk(ctx context.Context) ([]dto.FinalStokMerk, error) {
	var results []dto.FinalStokMerk

	// Query to calculate total stock and total notional grouped by merk
	err := r.db.Table("merks m").
		Select(`
			m.nama AS merk,
			SUM(dp.stok) AS total_stok,
			SUM(dp.stok * p.harga_jual) AS total_notional
		`).
		Joins("JOIN detail_merk_suppliers dms ON m.id = dms.merk_id").
		Joins("JOIN detail_produks dp ON dms.detail_merk_supplier_id = dp.detail_merk_supplier_id").
		Joins("JOIN produks p ON dp.produk_id = p.id").
		Group("m.id").
		Order("m.nama").
		Find(&results).Error

	return results, err
}

func getJenisDetailsByMerk(db *gorm.DB, merkID int) ([]dto.FinalGetJenisDetail, error) {
	var details []dto.FinalGetJenisDetail
	err := db.Table("jenis j").
		Select(`
			j.nama_jenis AS jenis,
			dp.ukuran AS ukuran,
			SUM(dp.stok) AS jumlah,
			AVG(p.harga_jual) AS harga_jual,
			SUM(dp.stok * p.harga_jual) AS total_notional
		`).
		Joins("JOIN detail_merk_suppliers dms ON j.id = dms.jenis_id").
		Joins("JOIN detail_produks dp ON dms.detail_merk_supplier_id = dp.detail_merk_supplier_id").
		Joins("JOIN produks p ON dp.produk_id = p.id").
		Where("dms.merk_id = ?", merkID).
		Group("j.id, dp.ukuran").
		Order("j.nama_jenis, dp.ukuran").
		Find(&details).Error
	return details, err
}
