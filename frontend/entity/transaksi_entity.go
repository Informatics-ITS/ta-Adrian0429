package entity

import (
	"time"
)

type (
	Transaksi struct {
		ID               int64     `gorm:"primaryKey;autoIncrement;type:bigint" json:"id"`
		TanggalTransaksi time.Time `gorm:"type:timestamptz" json:"tanggal_transaksi"`
		TotalHarga       float64   `gorm:"type:decimal(19,2)" json:"total_harga"`
		MetodeBayar      string    `json:"metode_bayar"`
		Diskon           float64   `gorm:"type:decimal(19,2)" json:"diskon"`

		DetailTransaksi []DetailTransaksi `json:"DetailTransaksi,omitempty" gorm:"onDelete:CASCADE"`
		Cabang          []Cabang          `gorm:"many2many:cabang_transaksi;"`
		ReturnUser      []ReturnUser      `json:"ReturnUser,omitempty" gorm:"foreignKey:TransaksiID;constraint:onDelete:CASCADE"`

		CreatedBy string `json:"created_by"`
		Timestamp
	}

	DetailTransaksi struct {
		ID           int `gorm:"primaryKey;autoIncrement" json:"id"`
		JumlahProduk int `json:"jumlah_produk"`

		TransaksiID    int64 `gorm:"type:uuid" json:"-"`
		DetailProdukID int   `gorm:"type:uuid" json:"-"`

		DetailReturnUser []DetailReturnUser `json:"DetailReturnUser,omitempty" gorm:"foreignKey:DetailTransaksiID;constraint:onDelete:CASCADE"`
		
		Timestamp
	}
)
