package entity

type Supplier struct {
	ID       int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name     string `json:"name"`
	NoHp     string `json:"no_hp"`
	Discount int    `json:"discount"`

	DetailMerkSuppliers []DetailMerkSupplier `json:"detail_merk_suppliers,omitempty" gorm:"foreignKey:SupplierID;constraint:onDelete:CASCADE"`
	Restok              []Restok             `json:"restok,omitempty" gorm:"foreignKey:SupplierID;constraint:onDelete:CASCADE"`
	Timestamp
}
