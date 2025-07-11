package entity

type (
	// ReturnUser represents a product return record related to a transaction
	ReturnUser struct {
		ID          int64  `gorm:"primaryKey" json:"id"`
		Alasan      string `json:"alasan"`
		TransaksiID int64  `json:"transaksi_id"`
		Timestamp

		Transaksi         Transaksi          `gorm:"foreignKey:TransaksiID;references:ID;constraint:onDelete:CASCADE"`
		DetailReturnsUser []DetailReturnUser `json:"detail_returns,omitempty" gorm:"foreignKey:ReturnUserID;constraint:onDelete:CASCADE"`
	}

	// DetailReturnUser represents the details of a user return transaction
	DetailReturnUser struct {
		ID                int   `gorm:"primaryKey;autoIncrement" json:"id"`
		JumlahProduk      int   `json:"jumlah_produk"`
		ReturnUserID      int64 `gorm:"not null" json:"return_user_id"`
		DetailProdukID    int   `gorm:"not null" json:"detail_produk_id"`
		DetailTransaksiID int   `gorm:"not null" json:"detail_transaksi_id"`
		Timestamp

		ReturnUser      ReturnUser      `gorm:"foreignKey:ReturnUserID;references:ID;constraint:onDelete:CASCADE"`
		DetailTransaksi DetailTransaksi `gorm:"foreignKey:DetailTransaksiID;references:ID;constraint:onDelete:CASCADE"`
		DetailProduk    DetailProduk    `gorm:"foreignKey:DetailProdukID;references:ID;constraint:onDelete:CASCADE"`
	}

	// ReturnSupplier represents a supplier return record
	ReturnSupplier struct {
		ID       int64  `gorm:"primaryKey" json:"id"`
		Alasan   string `json:"alasan"`
		RestokID int64  `json:"restok_id"`
		Timestamp

		Restok                Restok                 `gorm:"foreignKey:RestokID;references:ID;constraint:onDelete:CASCADE"`
		DetailReturnsSupplier []DetailReturnSupplier `json:"detail_returns,omitempty" gorm:"foreignKey:ReturnSupplierID;constraint:onDelete:CASCADE"`
	}

	// DetailReturnSupplier represents the details of a supplier return transaction
	DetailReturnSupplier struct {
		ID               int   `gorm:"primaryKey;autoIncrement" json:"id"`
		JumlahProduk     int   `json:"jumlah_produk"`
		ReturnSupplierID int64 `gorm:"not null" json:"return_supplier_id"`
		DetailRestokID   int   `gorm:"not null" json:"detail_restok_id"`
		DetailProdukID   int   `gorm:"not null" json:"detail_produk_id"`
		Timestamp

		ReturnSupplier ReturnSupplier `gorm:"foreignKey:ReturnSupplierID;references:ID;constraint:onDelete:CASCADE"`
		DetailRestok   DetailRestok   `gorm:"foreignKey:DetailRestokID;references:ID;constraint:onDelete:CASCADE"`
		DetailProduk   DetailProduk   `gorm:"foreignKey:DetailProdukID;references:ID;constraint:onDelete:CASCADE"`
	}
)
