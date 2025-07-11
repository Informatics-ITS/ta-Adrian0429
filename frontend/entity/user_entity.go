package entity

import (
	"bumisubur-be/helpers"
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           int       `gorm:"primaryKey;autoIncrement" json:"id"`
	NIK          string    `json:"nik"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Password     string    `json:"password"`
	NoHp         string    `json:"no_hp"`
	Role         string    `json:"role"`
	TanggalMasuk time.Time `gorm:"type:timestamptz" json:"tanggal_masuk"`
	TanggalLahir time.Time `gorm:"type:timestamptz" json:"tanggal_lahir"`
	TempatLahir  string    `json:"tempat_lahir"`
	Alamat       string    `json:"alamat"`
	Timestamp

	LogAkses []LogAkses `json:"LogAkses,omitempty"`
	Cabang   []Cabang   `gorm:"many2many:cabang_user;"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	var err error
	u.Password, err = helpers.HashPassword(u.Password)
	if err != nil {
		return err
	}
	return nil
}
