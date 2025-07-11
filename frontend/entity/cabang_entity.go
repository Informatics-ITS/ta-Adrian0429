package entity

type Cabang struct {
	ID         int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string `json:"nama"`
	Alamat     string `json:"alamat"`
	Keterangan string `json:"keterangan"`

	Produk    []Produk    `json:"Produk,omitempty" gorm:"onDelete:CASCADE"`
	User      []User      `gorm:"many2many:cabang_user;"`
	Transaksi []Transaksi `gorm:"many2many:cabang_transaksi;"`

	Timestamp
}
