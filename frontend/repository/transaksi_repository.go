package repository

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"context"
	"database/sql"
	"time"

	"gorm.io/gorm"
)

type (
	TransaksiRepository interface {
		CreateTransaksi(ctx context.Context, tx *gorm.DB, transaksi entity.Transaksi) (entity.Transaksi, error)
		CreateDetailTransaksi(ctx context.Context, tx *gorm.DB, detailTransaksi entity.DetailTransaksi) (entity.DetailTransaksi, error)
		GetDetailProdukStok(ctx context.Context, tx *gorm.DB, detailProdukID int) (entity.DetailProduk, error)

		GetTransaksi(ctx context.Context, tx *gorm.DB) ([]entity.Transaksi, error)

		GetTransaksiByNota(ctx context.Context, tx *gorm.DB, req dto.TransactionPaginationRequest) (dto.RepoGetTransaksiNota, error)
		GetTransaksiNotaDetail(ctx context.Context, tx *gorm.DB, transaksiID string) ([]dto.DetailTransaksiNota, error)

		GetTransaksiByProduk(ctx context.Context, tx *gorm.DB, req dto.TransactionPaginationRequest) (dto.GetTransaksiProdukResponse, error)
		GetTransaksiProdukDetail(ctx context.Context, tx *gorm.DB, detailProdukID string, filter string) (dto.GetTransaksiProdukDetail, error)

		GetIndexTransaksi(ctx context.Context, tx *gorm.DB) ([]dto.IndexTransaksi, error)
		GetProdukByDetailID(ctx context.Context, tx *gorm.DB, detailProdukID int) (entity.Produk, error)

		GetLatestTransaksiID(ctx context.Context, date string) (int64, error)

		GetNotaData(ctx context.Context, tx *gorm.DB, notaID string) (entity.Transaksi, error)
		GetNotaDataDetail(ctx context.Context, tx *gorm.DB, transaksiID string) ([]dto.DetailReturnUser, error)
	}

	transaksiRepository struct {
		db *gorm.DB
	}
)

func NewTransaksiRepository(db *gorm.DB) TransaksiRepository {
	return &transaksiRepository{
		db: db,
	}
}

func (t *transaksiRepository) GetProdukByDetailID(ctx context.Context, tx *gorm.DB, detailProdukID int) (entity.Produk, error) {
	if tx == nil {
		tx = t.db
	}

	var produk entity.Produk
	err := tx.WithContext(ctx).Table("produks p").
		Joins("join detail_produks dp on p.id = dp.produk_id").
		Where("dp.id = ?", detailProdukID).
		First(&produk).Error

	if err != nil {
		return entity.Produk{}, err
	}

	return produk, nil
}

func (t *transaksiRepository) CreateTransaksi(ctx context.Context, tx *gorm.DB, transaksi entity.Transaksi) (entity.Transaksi, error) {
	if tx == nil {
		tx = t.db
	}

	if err := tx.WithContext(ctx).Create(&transaksi).Error; err != nil {
		return entity.Transaksi{}, err
	}

	return transaksi, nil
}


func (t *transaksiRepository) CreateDetailTransaksi(ctx context.Context, tx *gorm.DB, detailTransaksi entity.DetailTransaksi) (entity.DetailTransaksi, error) {
	if tx == nil {
		tx = t.db
	}

	if err := tx.WithContext(ctx).Create(&detailTransaksi).Error; err != nil {
		return entity.DetailTransaksi{}, err
	}

	if err := tx.WithContext(ctx).
		Model(&entity.DetailProduk{}).
		Where("id = ?", detailTransaksi.DetailProdukID).
		UpdateColumn("stok", gorm.Expr("stok - ?", detailTransaksi.JumlahProduk)).
		Error; err != nil {
		return entity.DetailTransaksi{}, err
	}

	return detailTransaksi, nil
}


func (t *transaksiRepository) GetDetailProdukStok(ctx context.Context, tx *gorm.DB, detailProdukID int) (entity.DetailProduk, error) {
	if tx == nil {
		tx = t.db
	}

	var detailProduk entity.DetailProduk
	err := tx.WithContext(ctx).Where("id = ?", detailProdukID).First(&detailProduk).Error
	if err != nil {
		return entity.DetailProduk{}, err
	}

	return detailProduk, nil
}

func (t *transaksiRepository) GetTransaksi(ctx context.Context, tx *gorm.DB) ([]entity.Transaksi, error) {
	var transaksi []entity.Transaksi

	err := t.db.WithContext(ctx).Find(&transaksi).Error
	if err != nil {
		return nil, err
	}

	return transaksi, nil
}

func (t *transaksiRepository) GetTransaksiByNota(ctx context.Context, tx *gorm.DB, req dto.TransactionPaginationRequest) (dto.RepoGetTransaksiNota, error) {

	var err error
	var count int64

	if req.PerPage == 0 {
		req.PerPage = 20
	}

	if req.Page == 0 {
		req.Page = 1
	}

	var start time.Time
	var end time.Time

	if req.Range == "today" {
		start = time.Now().Truncate(24 * time.Hour)
		end = start.Add(24 * time.Hour).Add(-time.Second)
	}

	if req.Range == "week" {
		now := time.Now()
		start = now.AddDate(0, 0, -int(now.Weekday()))
		start = start.Truncate(24 * time.Hour)
		end = start.AddDate(0, 0, 7).Add(-time.Second)
	}

	if req.Range == "month" {
		now := time.Now()
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 1, 0).Add(-time.Second)
	}

	if req.StartDate != "" && req.EndDate != "" {

		start, err = time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			return dto.RepoGetTransaksiNota{}, err
		}
		start = start.Truncate(24 * time.Hour)

		end, err = time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			return dto.RepoGetTransaksiNota{}, err
		}
		end = end.Add(24 * time.Hour).Add(-time.Second)
	}

	query := t.db.WithContext(ctx).Table("transaksis t").
		Select("t.id as id_transaksi, sum(dt.jumlah_produk) as total_produk, t.total_harga as total_pendapatan, t.created_at as tanggal_transaksi, t.diskon as diskon_transaksi").
		Joins("join detail_transaksis dt on t.id = dt.transaksi_id").
		Where("t.created_at BETWEEN ? AND ?", start, end).
		Group("t.id").
		Order("t.id").
		Limit(req.PerPage)

	if req.Search != "" {
		query = query.Where("t.id LIKE ?", "%"+req.Search+"%")
	}

	err = query.Count(&count).Error
	if err != nil {
		return dto.RepoGetTransaksiNota{}, err
	}

	var result []dto.GetTransaksiNotaRepo
	err = query.Offset((req.Page - 1) * req.PerPage).Find(&result).Error
	if err != nil {
		return dto.RepoGetTransaksiNota{}, err
	}

	return dto.RepoGetTransaksiNota{
		Data: result,
		PaginationResponse: dto.PaginationResponse{
			Page:    req.Page,
			Count:   count,
			MaxPage: int64(count) / int64(req.PerPage),
			PerPage: req.PerPage,
		},
	}, nil

}

func (t *transaksiRepository) GetTransaksiNotaDetail(ctx context.Context, tx *gorm.DB, transaksiID string) ([]dto.DetailTransaksiNota, error) {
	if tx == nil {
		tx = t.db
	}

	var result []dto.DetailTransaksiNota
	err := tx.WithContext(ctx).Raw(`

    SELECT 
			m.nama AS merk, 
			p.nama_produk, 
			j.nama_jenis AS jenis, 
			dp.ukuran, 
			dt.jumlah_produk as jumlah_item, 
			p.harga_jual as harga_produk,
			COALESCE(SUM((p.harga_jual * dt.jumlah_produk * (1 - (CAST(t.diskon AS DECIMAL(5, 2)) / 100))) - (dp.harga_beli * dt.jumlah_produk)), 0) AS total_profit
		FROM transaksis t
		JOIN detail_transaksis dt on dt.transaksi_id = t.id
		JOIN detail_produks dp ON dt.detail_produk_id = dp.id 
		JOIN produks p ON dp.produk_id = p.id
		JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id
		JOIN merks m ON dms.merk_id = m.id
		JOIN jenis j ON dms.jenis_id = j.id
		WHERE dt.transaksi_id = ?
		GROUP BY m.nama, p.nama_produk, j.nama_jenis, dp.ukuran, dt.jumlah_produk, p.harga_jual

	`, transaksiID).Scan(&result).Error

	if err != nil {
		return nil, err
	}

	return result, nil
}

func (t *transaksiRepository) GetTransaksiByProduk(ctx context.Context, tx *gorm.DB, req dto.TransactionPaginationRequest) (dto.GetTransaksiProdukResponse, error) {
	var err error
	var count int64
	var start time.Time
	var end time.Time

	// Define date range based on req.Range
	if req.Range == "today" {
		start = time.Now().Truncate(24 * time.Hour)
		end = start.Add(24 * time.Hour).Add(-time.Second)
	} else if req.Range == "week" {
		now := time.Now()
		start = now.AddDate(0, 0, -int(now.Weekday()))
		start = start.Truncate(24 * time.Hour)
		end = start.AddDate(0, 0, 7).Add(-time.Second)
	} else if req.Range == "month" {
		now := time.Now()
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 1, 0).Add(-time.Second)
	} else if req.StartDate != "" && req.EndDate != "" {
		start, err = time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			return dto.GetTransaksiProdukResponse{}, err
		}
		start = start.Truncate(24 * time.Hour)

		end, err = time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			return dto.GetTransaksiProdukResponse{}, err
		}
		end = end.Add(24 * time.Hour).Add(-time.Second)
	}

	// Default pagination values
	if req.PerPage == 0 {
		req.PerPage = 100
	}
	if req.Page == 0 {
		req.Page = 1
	}

	// Updated query
	query := t.db.WithContext(ctx).Table("produks p").
		Select(`
        t.id AS nomor_nota,
        p.id AS produk_id,
        p.barcode_id,
        dp.id AS detail_id,
        p.nama_produk,
        m.nama AS merk,
        j.nama_jenis AS jenis,
        dp.ukuran,
        dp.warna,
        MAX(t.created_at) AS tanggal_transaksi,
        COALESCE(SUM(dt.jumlah_produk), 0) AS total_barang,
        COALESCE(SUM(p.harga_jual * dt.jumlah_produk), 0) AS total_pendapatan,
		COALESCE(SUM((p.harga_jual * dt.jumlah_produk * (1 - (CAST(t.diskon AS DECIMAL(5, 2)) / 100))) - (dp.harga_beli * dt.jumlah_produk)), 0) AS total_profit 
    `).
		Joins("JOIN detail_produks dp ON p.id = dp.produk_id").
		Joins("JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id").
		Joins("JOIN merks m ON dms.merk_id = m.id").
		Joins("JOIN jenis j ON dms.jenis_id = j.id").
		Joins("JOIN detail_transaksis dt ON dp.id = dt.detail_produk_id").
		Joins("JOIN transaksis t ON dt.transaksi_id = t.id").
		Where("t.created_at BETWEEN ? AND ?", start, end).
		Where("p.cabang_id = ?", req.Cabang).
		Group("p.id, t.id, dp.id, m.nama, j.nama_jenis").
		Order("t.id ASC").
		Limit(req.PerPage)

	// Add search condition if provided
	if req.Search != "" {
		query = query.Where("p.nama_produk LIKE ?", "%"+req.Search+"%")
	}

	// Count total results
	err = query.Count(&count).Error
	if err != nil {
		return dto.GetTransaksiProdukResponse{}, err
	}

	// Fetch paginated results
	var transaksisResult []dto.GetTransaksiProduk
	err = query.Offset((req.Page - 1) * req.PerPage).Find(&transaksisResult).Error
	if err != nil {
		return dto.GetTransaksiProdukResponse{}, err
	}

	// in case need to remove .00 for whole numbers

	// for i := range transaksisResult {
	// 	total := transaksisResult[i].TotalPendapatan
	// 	if total == float64(int64(total)) {
	// 		transaksisResult[i].TotalPendapatan = float64(int64(total)) // Remove .00 for whole numbers
	// 	}
	// }
	var SumTotalProfit float64
	for _, transaksi := range transaksisResult {
		SumTotalProfit += transaksi.TotalProfit
	}

	// Prepare response
	result := dto.GetTransaksiProdukResponse{
		Data:           transaksisResult,
		SumTotalProfit: SumTotalProfit,
		PaginationResponse: dto.PaginationResponse{
			Page:    req.Page,
			Count:   count,
			MaxPage: (count + int64(req.PerPage) - 1) / int64(req.PerPage),
			PerPage: req.PerPage,
		},
	}

	return result, nil
}

func (t *transaksiRepository) GetTransaksiProdukDetail(ctx context.Context, tx *gorm.DB, detailProdukID string, filter string) (dto.GetTransaksiProdukDetail, error) {
	if tx == nil {
		tx = t.db
	}

	var start time.Time
	var end time.Time

	if filter == "today" {
		start = time.Now().Truncate(24 * time.Hour)
		end = start.Add(24 * time.Hour).Add(-time.Second)
	}

	if filter == "week" {
		now := time.Now()
		start = now.AddDate(0, 0, -int(now.Weekday()))
		start = start.Truncate(24 * time.Hour)
		end = start.AddDate(0, 0, 7).Add(-time.Second)
	}

	if filter == "month" {
		now := time.Now()
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 1, 0).Add(-time.Second)
	}

	var result dto.GetTransaksiProdukDetail

	err := tx.WithContext(ctx).Raw(`
		SELECT 
			SUM(dt.jumlah_produk) AS total_barang, 
			SUM(p.harga_jual * dt.jumlah_produk) AS total_pendapatan, 
			MAX(t.created_at) AS tanggal_penjualan
		FROM transaksis t
		JOIN detail_transaksis dt ON t.id = dt.transaksi_id
		JOIN detail_produks dp ON dp.id = dt.detail_produk_id
		JOIN produks p ON p.id = dp.produk_id
		WHERE dt.detail_produk_id = ?
		AND t.created_at BETWEEN ? AND ?
	`, detailProdukID, start, end).Scan(&result).Error

	if err != nil {
		return dto.GetTransaksiProdukDetail{}, err
	}

	return result, nil
}

func (t *transaksiRepository) GetIndexTransaksi(ctx context.Context, tx *gorm.DB) ([]dto.IndexTransaksi, error) {
	if tx == nil {
		tx = t.db
	}

	var produkData []struct {
		IDProduk   int     `json:"id_produk"`
		NamaProduk string  `json:"nama_produk"`
		BarcodeID  string  `json:"barcode_id"`
		HargaJual  float64 `json:"harga_jual"`
		Merk       string  `json:"merk"`
	}

	err := tx.WithContext(ctx).Raw(`
		select DISTINCT (p.id) as id_produk,
		p.nama_produk,
		p.barcode_id,
		p.harga_jual,
		m.nama as merk
	FROM
		produks p
		JOIN detail_produks dp ON p.id = dp.produk_id
		JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id
		JOIN merks m ON dms.merk_id = m.id
	WHERE
		dp.status = 1

	`).Scan(&produkData).Error

	if err != nil {
		return nil, err
	}

	var result []dto.IndexTransaksi

	for _, produk := range produkData {

		var sizeData []struct {
			Ukuran string `json:"ukuran"`
		}

		err := tx.WithContext(ctx).Raw(`
			SELECT DISTINCT dp.ukuran 
			FROM detail_produks dp
			WHERE dp.produk_id = ? and dp.status = 1
		`, produk.IDProduk).Scan(&sizeData).Error

		if err != nil {
			return nil, err
		}

		var sizes []dto.SizeIndexTransaksi

		for _, size := range sizeData {
			var details []dto.DetailIndexTransaksi

			err := tx.WithContext(ctx).Raw(`
				SELECT dp.id as detail_produk_id, dp.warna, dp.stok
				FROM detail_produks dp
				WHERE dp.produk_id = ? AND dp.ukuran = ? and dp.status = 1
			`, produk.IDProduk, size.Ukuran).Scan(&details).Error

			if err != nil {
				return nil, err
			}

			sizes = append(sizes, dto.SizeIndexTransaksi{
				Ukuran:  size.Ukuran,
				Details: details,
			})
		}

		result = append(result, dto.IndexTransaksi{
			IDProduk:   produk.IDProduk,
			NamaProduk: produk.NamaProduk,
			BarcodeID:  produk.BarcodeID,
			HargaJual:  produk.HargaJual,
			Merk:       produk.Merk,
			Sizes:      sizes,
		})
	}

	return result, nil
}

func (r *transaksiRepository) GetLatestTransaksiID(ctx context.Context, date string) (int64, error) {
	var latestID int64
	err := r.db.WithContext(ctx).
		Table("transaksis").
		Select("id").
		Where("id BETWEEN ? AND ?", date+"0000", date+"9999").
		Order("id DESC").
		Limit(1).
		Row().
		Scan(&latestID)

	if err != nil {
		if err == gorm.ErrRecordNotFound || err == sql.ErrNoRows {
			// No rows found, return 0 to indicate no transactions exist for the day
			return 0, nil
		}
		// Return other errors
		return 0, err
	}

	return latestID, nil
}

func (r *transaksiRepository) GetNotaData(ctx context.Context, tx *gorm.DB, notaID string) (entity.Transaksi, error) {
	if tx == nil {
		tx = r.db
	}

	var transaksi entity.Transaksi
	err := tx.WithContext(ctx).Where("id = ?", notaID).First(&transaksi).Error
	if err != nil {
		return entity.Transaksi{}, err
	}

	return transaksi, nil

}

func (r *transaksiRepository) GetNotaDataDetail(ctx context.Context, tx *gorm.DB, transaksiID string) ([]dto.DetailReturnUser, error) {
	if tx == nil {
		tx = r.db
	}

	var result []dto.DetailReturnUser
	err := tx.WithContext(ctx).Raw(`
    SELECT 	
			dt.id AS detail_transaksi_id,
			dp.id AS detail_produk_id,	
			m.nama AS merk, 
			p.nama_produk, 
			j.nama_jenis AS jenis, 
			dp.ukuran, 
			dt.jumlah_produk as jumlah_item, 
			p.harga_jual as harga_produk
		FROM transaksis t
		JOIN detail_transaksis dt on dt.transaksi_id = t.id
		JOIN detail_produks dp ON dt.detail_produk_id = dp.id 
		JOIN produks p ON dp.produk_id = p.id
		JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id
		JOIN merks m ON dms.merk_id = m.id
		JOIN jenis j ON dms.jenis_id = j.id
		WHERE dt.transaksi_id = ?
		GROUP BY m.nama, p.nama_produk, j.nama_jenis, dp.ukuran, dt.jumlah_produk, p.harga_jual, dt.id, dp.id

	`, transaksiID).Scan(&result).Error

	if err != nil {
		return nil, err
	}

	return result, nil
}
