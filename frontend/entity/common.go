package entity

import (
	"time"

	"gorm.io/gorm"
)

type Timestamp struct {
	CreatedAt time.Time      `gorm:"type:timestamptz" json:"created_at"`
	UpdatedAt time.Time      `gorm:"type:timestamptz" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

type Authorization struct {
	Token string `json:"token"`
	Role  string `json:"role"`
}
