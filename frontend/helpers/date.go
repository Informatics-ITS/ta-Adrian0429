package helpers

import (
	"database/sql/driver"
	"fmt"
	"time"
)

type CustomTime struct {
	time.Time
}

func (t *CustomTime) UnmarshalJSON(b []byte) (err error) {
	date, err := time.Parse(`"2006-01-02"`, string(b))
	if err != nil {
		// Jika gagal, coba parsing dengan format waktu lengkap
		date, err = time.Parse(`"2006-01-02T15:04:05.000-0700"`, string(b))
		if err != nil {
			return err
		}
	}
	t.Time = date
	return
}

func (ct *CustomTime) Scan(value interface{}) error {
	if v, ok := value.(time.Time); ok {
		*ct = CustomTime{Time: v}
		return nil
	}
	return fmt.Errorf("cannot scan type %T into CustomTime", value)
}

// Value untuk menyimpan nilai dari CustomTime ke database
func (ct CustomTime) Value() (driver.Value, error) {
	return ct.Time, nil
}
