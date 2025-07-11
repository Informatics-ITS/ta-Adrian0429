package entity

type (
	Produk struct {
		ID         int     `gorm:"primaryKey;autoIncrement;start:100" json:"id"`
		NamaProduk string  `json:"nama_produk"`
		BarcodeID  string  `json:"barcode_produk"`
		CabangID   int     `gorm:"type:int;not null" json:"cabang_id"`
		HargaJual  float64 `gorm:"type:decimal(19,2)" json:"harga_jual"`

		Restok       []Restok       `json:"Restok,omitempty" gorm:"foreignKey:ProdukID;constraint:onDelete:CASCADE"`
		DetailProduk []DetailProduk `json:"DetailProduk,omitempty" gorm:"foreignKey:ProdukID;constraint:onDelete:CASCADE"`
		Timestamp
	}

	DetailProduk struct {
		ID        int     `gorm:"primaryKey;autoIncrement" json:"id"`
		Ukuran    string  `json:"ukuran_produk"`
		Warna     string  `json:"warna_produk"`
		Stok      int     `json:"stok_produk"`
		Status    int     `gorm:"type:int" json:"status_produk"`
		HargaBeli float64 `gorm:"type:decimal(19,2)" json:"harga_beli"`

		ProdukID             int `gorm:"type:int;not null" json:"produk_id"`
		DetailMerkSupplierID int `gorm:"not null" json:"detail_merk_supplier_id"`

		DetailRestok     []DetailRestok     `json:"Restok,omitempty" gorm:"foreignKey:DetailProdukID;constraint:onDelete:CASCADE"`
		DetailTransaksi  []DetailTransaksi  `json:"DetailTransaksi,omitempty" gorm:"foreignKey:DetailProdukID;constraint:onDelete:CASCADE"`
		DetailReturnUser []DetailReturnUser `json:"DetailReturnUser,omitempty" gorm:"foreignKey:DetailProdukID;constraint:onDelete:CASCADE"`
		Timestamp
	}

	Merk struct {
		ID   int    `gorm:"primaryKey;autoIncrement;start:100" json:"id"`
		Nama string `json:"nama_merk"`

		DetailMerkSuppliers []DetailMerkSupplier `json:"detail_merk_suppliers,omitempty" gorm:"foreignKey:MerkID;constraint:onDelete:CASCADE"`
		Timestamp
	}

	Jenis struct {
		ID        int    `gorm:"primaryKey;autoIncrement;start:100" json:"id"`
		NamaJenis string `json:"nama_jenis"`

		DetailMerkSuppliers []DetailMerkSupplier `json:"detail_merk_suppliers,omitempty" gorm:"foreignKey:JenisID;constraint:onDelete:CASCADE"`
		Timestamp
	}

	DetailMerkSupplier struct {
		DetailMerkSupplierID int `gorm:"primaryKey;autoIncrement" json:"detail_merk_supplier_id"`
		SupplierID           int `gorm:"type:char(16);not null" json:"supplier_id"`
		MerkID               int `gorm:"type:char(16);not null" json:"merk_id"`
		JenisID              int `gorm:"type:char(16);not null" json:"jenis_id"`
		Discount             int `json:"discount"`

		Supplier     Supplier       `gorm:"foreignKey:SupplierID;references:ID;constraint:onDelete:CASCADE"`
		Merk         Merk           `gorm:"foreignKey:MerkID;references:ID;constraint:onDelete:CASCADE"`
		Jenis        Jenis          `gorm:"foreignKey:JenisID;references:ID;constraint:onDelete:CASCADE"`
		DetailProduk []DetailProduk `json:"DetailProduk,omitempty" gorm:"foreignKey:DetailMerkSupplierID;constraint:onDelete:CASCADE"`
	}
)
