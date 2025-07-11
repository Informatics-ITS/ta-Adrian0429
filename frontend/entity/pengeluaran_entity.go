package entity

import (
	"time"
)

type (
	Pengeluaran struct {
		ID                  int       `gorm:"primaryKey;autoIncrement" json:"id"`
		NamaPengeluaran     string    `json:"nama_pengeluaran"`
		TipePembayaran      string    `json:"tipe_pembayaran"`
		KategoriPengeluaran string    `json:"kategori_pengeluaran"`
		Jumlah              float64   `json:"jumlah"`
		Tujuan              string    `json:"tujuan"`
		TanggalPengeluaran  time.Time `gorm:"type:timestamptz" json:"tanggal_pengeluaran"`
		Description         string    `json:"description"`

		Timestamp
	}
)
