package repository

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"context"
	"time"

	"gorm.io/gorm"
)

type ReturnRepository interface {
	CreateReturnSupplier(ctx context.Context, returnSupplier entity.ReturnSupplier) (entity.ReturnSupplier, error)
	CreateDetailReturnSupplier(ctx context.Context, detailReturnSupplier entity.DetailReturnSupplier) (entity.DetailReturnSupplier, error)
	DecreaseStock(ctx context.Context, detailProdukID int, jumlah int) error
	ReduceRestokItem(ctx context.Context, detailRestokID int, jumlah int) error

	GetReturnSupplier(ctx context.Context, tx *gorm.DB, restokID string) (dto.GetReturnSupplier, error)
	GetReturnUser(ctx context.Context, tx *gorm.DB, notaID string) (entity.Transaksi, error)
	GetReturnUserDetail(ctx context.Context, tx *gorm.DB, transaksiID string) ([]dto.DetailReturnUser, error)

	IncreaseStock(ctx context.Context, productID int, quantity int) error
	ReduceTransactionItem(ctx context.Context, detailTransaksiID int, quantity int) error
	GetProductPrice(ctx context.Context, tx *gorm.DB, detailProdukID int) (float64, error)
	UpdateTransactionTotal(ctx context.Context, transaksiID int64, totalReturnAmount float64) error

	CreateReturnUser(ctx context.Context, returnData entity.ReturnUser) (entity.ReturnUser, error)
	CreateDetailReturnUser(ctx context.Context, returnData entity.DetailReturnUser) (entity.DetailReturnUser, error)
	GetReturnUserHistoryWithDetails(ctx context.Context, start string, stop string) ([]dto.HistoryReturnUser, error)
	GetReturnSupplierHistoryWithDetails(ctx context.Context, start string, stop string) ([]dto.HistoryReturnSupplier, error)
}

type returnRepository struct {
	db *gorm.DB
}

func NewReturnRepository(db *gorm.DB) ReturnRepository {
	return &returnRepository{db: db}
}

func (r *returnRepository) GetReturnSupplier(ctx context.Context, tx *gorm.DB, restokID string) (dto.GetReturnSupplier, error) {
	if tx == nil {
		tx = r.db
	}

	var restokData struct {
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
		First(&restokData).Error; err != nil {
		return dto.GetReturnSupplier{}, err
	}

	var result dto.GetReturnSupplier

	var stokDetails []dto.DetailReturnSupplier

	if err := tx.WithContext(ctx).
		Table("detail_produks dp").
		Select("dp.id as detail_produk_id, dr.id as detail_restok_id, dp.ukuran, dp.warna, dp.stok as jumlah_stok, dr.jumlah as jumlah_restok, r.tanggal_restok").
		Joins("LEFT JOIN detail_restoks dr ON dp.id = dr.detail_produk_id").
		Joins("LEFT JOIN restoks r ON dr.restok_id = r.id").
		Where("r.id = ?", restokID).
		Scan(&stokDetails).Error; err != nil {
		return dto.GetReturnSupplier{}, err
	}

	result = dto.GetReturnSupplier{
		ID:         restokData.ID,
		RestokID:   restokData.RestokID,
		Barcode:    restokData.Barcode,
		NamaProduk: restokData.NamaProduk,
		Merk:       restokData.Merk,
		Jenis:      restokData.Jenis,
		CV:         restokData.CV,
		Supplier:   restokData.Supplier,
		HargaJual:  restokData.HargaJual,
		Stoks:      stokDetails,
	}

	return result, nil
}

func (r *returnRepository) GetReturnUser(ctx context.Context, tx *gorm.DB, notaID string) (entity.Transaksi, error) {
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

func (r *returnRepository) GetReturnUserDetail(ctx context.Context, tx *gorm.DB, transaksiID string) ([]dto.DetailReturnUser, error) {
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

func (r *returnRepository) IncreaseStock(ctx context.Context, productID int, quantity int) error {
	return r.db.WithContext(ctx).Model(&entity.DetailProduk{}).
		Where("id = ?", productID).
		Update("stok", gorm.Expr("stok + ?", quantity)).
		Error
}

func (r *returnRepository) ReduceTransactionItem(ctx context.Context, detailTransaksiID int, quantity int) error {
	return r.db.WithContext(ctx).Model(&entity.DetailTransaksi{}).
		Where("id = ?", detailTransaksiID).
		Update("jumlah_produk", gorm.Expr("jumlah_produk - ?", quantity)).
		Error
}

func (r *returnRepository) CreateReturnUser(ctx context.Context, returnData entity.ReturnUser) (entity.ReturnUser, error) {
	err := r.db.WithContext(ctx).Create(&returnData).Error
	if err != nil {
		return entity.ReturnUser{}, err
	}

	return returnData, nil
}

func (r *returnRepository) CreateDetailReturnUser(ctx context.Context, returnData entity.DetailReturnUser) (entity.DetailReturnUser, error) {
	err := r.db.WithContext(ctx).Create(&returnData).Error
	if err != nil {
		return entity.DetailReturnUser{}, err
	}

	return returnData, nil
}

func (r *returnRepository) GetProductPrice(ctx context.Context, tx *gorm.DB, detailProdukID int) (float64, error) {
	if tx == nil {
		tx = r.db
	}

	var hargaJual float64
	err := tx.WithContext(ctx).
		Table("detail_produks dp").
		Select("p.harga_jual").
		Joins("JOIN produks p ON dp.produk_id = p.id").
		Where("dp.id = ?", detailProdukID).
		Scan(&hargaJual).Error

	if err != nil {
		return 0, err
	}

	return hargaJual, nil
}

func (r *returnRepository) UpdateTransactionTotal(ctx context.Context, transaksiID int64, totalReturnAmount float64) error {
	return r.db.WithContext(ctx).Model(&entity.Transaksi{}).
		Where("id = ?", transaksiID).
		UpdateColumn("total_harga", gorm.Expr("total_harga - ?", totalReturnAmount)).
		Error
}

func (r *returnRepository) CreateReturnSupplier(ctx context.Context, returnSupplier entity.ReturnSupplier) (entity.ReturnSupplier, error) {
	err := r.db.WithContext(ctx).Create(&returnSupplier).Error
	return returnSupplier, err
}

func (r *returnRepository) CreateDetailReturnSupplier(ctx context.Context, detailReturnSupplier entity.DetailReturnSupplier) (entity.DetailReturnSupplier, error) {
	err := r.db.WithContext(ctx).Create(&detailReturnSupplier).Error
	return detailReturnSupplier, err
}

func (r *returnRepository) DecreaseStock(ctx context.Context, detailProdukID int, jumlah int) error {
	return r.db.WithContext(ctx).
		Model(&entity.DetailProduk{}).
		Where("id = ?", detailProdukID).
		UpdateColumn("stok", gorm.Expr("stok - ?", jumlah)).Error
}

func (r *returnRepository) ReduceRestokItem(ctx context.Context, detailRestokID int, jumlah int) error {
	return r.db.WithContext(ctx).
		Model(&entity.DetailRestok{}).
		Where("id = ?", detailRestokID).
		UpdateColumn("jumlah", gorm.Expr("jumlah - ?", jumlah)).Error
}

func (r *returnRepository) GetReturnUserHistoryWithDetails(ctx context.Context, start string, stop string) ([]dto.HistoryReturnUser, error) {
	var result []dto.HistoryReturnUser

	start = start + " 00:00:00"
	stop = stop + " 23:59:59"

	// Map to group details by ReturnID
	historyMap := make(map[int64]*dto.HistoryReturnUser)

	rows, err := r.db.WithContext(ctx).Raw(`
		SELECT 
			ru.id AS return_id,
			ru.alasan,
			ru.created_at AS tanggal_return,
			ru.transaksi_id AS nomor_nota,
			dru.jumlah_produk AS jumlah_return,
			p.nama_produk,
			p.barcode_id,
			dp.ukuran,
			dp.warna,
			m.nama AS merk
		FROM return_users ru
		LEFT JOIN detail_return_users dru ON ru.id = dru.return_user_id
		LEFT JOIN detail_produks dp ON dru.detail_produk_id = dp.id
		LEFT JOIN produks p ON dp.produk_id = p.id
		LEFT JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id
		LEFT JOIN merks m ON dms.merk_id = m.id
		WHERE ru.created_at BETWEEN ? AND ?
	`, start, stop).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var (
			returnID      int64
			alasan        string
			tanggalReturn time.Time
			nomorNota     string
			jumlahReturn  int
			namaProduk    string
			barcodeID     string
			ukuran        string
			warna         string
			merk          string
		)

		// Scan the row
		err := rows.Scan(&returnID, &alasan, &tanggalReturn, &nomorNota, &jumlahReturn, &namaProduk, &barcodeID, &ukuran, &warna, &merk)
		if err != nil {
			return nil, err
		}

		// Check if the return_id already exists in the map
		if _, exists := historyMap[returnID]; !exists {
			historyMap[returnID] = &dto.HistoryReturnUser{
				ReturnID:      returnID,
				Alasan:        alasan,
				TanggalReturn: tanggalReturn,
				NomorNota:     nomorNota,
			}
		}

		// Add detail if available
		if namaProduk != "" { // Only add if there's a detail
			historyMap[returnID].DetailHistoryReturnUser = append(historyMap[returnID].DetailHistoryReturnUser, dto.DetailHistoryReturnUser{
				NamaProduk:   namaProduk,
				BarcodeId:    barcodeID,
				JumlahReturn: jumlahReturn,
				Merk:         merk,
				Ukuran:       ukuran,
				Warna:        warna,
			})
		}
	}

	// Convert map to slice
	for _, v := range historyMap {
		result = append(result, *v)
	}

	return result, nil
}

func (r *returnRepository) GetReturnSupplierHistoryWithDetails(ctx context.Context, start string, stop string) ([]dto.HistoryReturnSupplier, error) {
	var result []dto.HistoryReturnSupplier

	start = start + " 00:00:00"
	stop = stop + " 23:59:59"

	// Map to group details by ReturnID
	historyMap := make(map[int64]*dto.HistoryReturnSupplier)

	rows, err := r.db.WithContext(ctx).Raw(`
		SELECT 
			rs.id AS return_id,
			rs.alasan,
			rs.created_at AS tanggal_return,
			rs.restok_id AS nomor_restok,
			drs.jumlah_produk AS jumlah_return,
			p.nama_produk,
			p.barcode_id,
			dp.warna,
			dp.ukuran,
			m.nama AS merk,
			s.name AS supplier
		FROM return_suppliers rs
		LEFT JOIN detail_return_suppliers drs ON rs.id = drs.return_supplier_id
		LEFT JOIN detail_produks dp ON drs.detail_produk_id = dp.id
		LEFT JOIN produks p ON dp.produk_id = p.id
		LEFT JOIN detail_merk_suppliers dms ON dp.detail_merk_supplier_id = dms.detail_merk_supplier_id
		LEFT JOIN merks m ON dms.merk_id = m.id
		LEFT JOIN detail_restoks dr ON drs.detail_restok_id = dr.id
		LEFT JOIN restoks r ON dr.restok_id = r.id
		LEFT JOIN suppliers s ON r.supplier_id = s.id
		WHERE rs.created_at BETWEEN ? AND ?
	`, start, stop).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var (
			returnID      int64
			alasan        string
			tanggalReturn time.Time
			nomorRestok   string
			jumlahReturn  int
			namaProduk    string
			barcodeID     string
			ukuran        string
			warna         string
			merk          string
			supplier      string
		)

		// Scan the row
		err := rows.Scan(&returnID, &alasan, &tanggalReturn, &nomorRestok, &jumlahReturn, &namaProduk, &barcodeID, &warna, &ukuran, &merk, &supplier)
		if err != nil {
			return nil, err
		}

		// Check if the return_id already exists in the map
		if _, exists := historyMap[returnID]; !exists {
			historyMap[returnID] = &dto.HistoryReturnSupplier{
				ReturnID:      returnID,
				Alasan:        alasan,
				TanggalReturn: tanggalReturn,
				NomorRestok:   nomorRestok,
			}
		}

		// Add detail if available
		if namaProduk != "" { // Only add if there's a detail
			historyMap[returnID].DetailHistoryReturnSupplier = append(historyMap[returnID].DetailHistoryReturnSupplier, dto.DetailHistoryReturnSupplier{
				NamaProduk:   namaProduk,
				BarcodeId:    barcodeID,
				JumlahReturn: jumlahReturn,
				Merk:         merk,
				Ukuran:       ukuran,
				Warna:        warna,
				Supplier:     supplier,
			})
		}
	}

	// Convert map to slice
	for _, v := range historyMap {
		result = append(result, *v)
	}

	return result, nil
}
