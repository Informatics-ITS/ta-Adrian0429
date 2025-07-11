package entity

import (
	"time"

	"gorm.io/gorm"
)

type (
	LogAkses struct {
		ID         int       `gorm:"primaryKey;autoIncrement" json:"id"`
		LoginTime  time.Time `json:"login_time"`
		LogOutTime time.Time `json:"logout_time"`

		DetailAkses []DetailAkses `json:"DetailAkses,omitempty" gorm:"onDelete:CASCADE"`
		UserID      int           `gorm:"type:int" json:"-"`

		Timestamp
	}

	DetailAkses struct {
		ID         int    `gorm:"primaryKey;autoIncrement" json:"id"`
		Activity   string `json:"activity"`
		IP         string `json:"ip_address"`
		Token      string `json:"token"`
		Payload    string `json:"payload"`
		LogAksesID int    `json:"log_akses_id"`
		Status     string `json:"status"`
		Timestamp
	}
)

func (logAkses *LogAkses) BeforeCreate(tx *gorm.DB) (err error) {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return err
	}
	logAkses.LoginTime = time.Now().In(loc)
	logAkses.LogOutTime = time.Now().In(loc).Add(10 * time.Hour)
	return nil
}
