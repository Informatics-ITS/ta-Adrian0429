package migrations

import (
	"bumisubur-be/entity"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&entity.User{},
		&entity.Restok{},
		&entity.Transaksi{},
		&entity.DetailTransaksi{},
		&entity.Supplier{},
		&entity.Cabang{},
		&entity.DetailProduk{},
		&entity.Jenis{},
		&entity.Merk{},
		&entity.Produk{},
		&entity.Pengeluaran{},
		&entity.LogAkses{},
		&entity.DetailAkses{},
		&entity.DetailMerkSupplier{},
		&entity.DetailRestok{},
		&entity.ReturnUser{},
		&entity.ReturnSupplier{},
		&entity.DetailReturnSupplier{},
		&entity.DetailReturnUser{},
	); err != nil {
		return err
	}

	return nil
}
