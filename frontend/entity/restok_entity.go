package entity

import "time"

type (
	Restok struct {
		ID         int64 `gorm:"primaryKey;autoIncrement;type:bigint" json:"id"`
		ProdukID   int   `gorm:"type:int;not null" json:"produk_id"`
		SupplierID int   `gorm:"type:int" json:"-"`

		TanggalRestok time.Time `gorm:"type:date" json:"tanggal_restok"`

		Supplier     Supplier       `json:"supplier,omitempty" gorm:"foreignKey:SupplierID"`
		Produk       Produk         `json:"produk,omitempty" gorm:"foreignKey:ProdukID"`
		DetailRestok []DetailRestok `json:"detail_restok,omitempty" gorm:"foreignKey:RestokID"`
		Timestamp
	}

	DetailRestok struct {
		ID             int   `gorm:"primaryKey;autoIncrement" json:"id"`
		Jumlah         int   `json:"jumlah"`
		RestokID       int64 `gorm:"type:bigint" json:"restok_id"`
		DetailProdukID int   `gorm:"type:int" json:"detail_produk_id"`

		DetailProduk DetailProduk `json:"detail_produk,omitempty" gorm:"foreignKey:DetailProdukID"`
		Restok       Restok       `json:"restok,omitempty" gorm:"foreignKey:RestokID"`

		Timestamp
	}
)
