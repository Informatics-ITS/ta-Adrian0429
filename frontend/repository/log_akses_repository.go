package repository

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"context"
	"time"

	"gorm.io/gorm"
)

type LogAksesRepository interface {
	CreateDetailAkses(ctx context.Context, tx *gorm.DB, detailAkses entity.DetailAkses)
	FindActiveLogAksesByUserID(ctx context.Context, tx *gorm.DB, userID int) int
	LogAkses(ctx context.Context, tx *gorm.DB, userId int) (entity.LogAkses, error)
	GetAllLogAkses(ctx context.Context, filter dto.LogAksesPaginationRequest) (dto.LogAksesPaginationResponse, error)
}

type logAksesRepository struct {
	db *gorm.DB
}

func NewLogAksesRepository(db *gorm.DB) LogAksesRepository {
	return &logAksesRepository{db: db}
}

func (r *logAksesRepository) CreateDetailAkses(ctx context.Context, tx *gorm.DB, detailAkses entity.DetailAkses) {
	r.db.Create(&detailAkses)
}

func (r *logAksesRepository) FindActiveLogAksesByUserID(ctx context.Context, tx *gorm.DB, userID int) int {
	var logAkses entity.LogAkses
	currentTime := time.Now()

	r.db.Where("user_id = ? AND log_out_time > ?", userID, currentTime).First(&logAkses)
	return logAkses.ID
}

func (r *logAksesRepository) LogAkses(ctx context.Context, tx *gorm.DB, userId int) (entity.LogAkses, error) {

	if tx == nil {
		tx = r.db
	}

	logAkses := entity.LogAkses{
		UserID: userId,
	}

	err := tx.WithContext(ctx).Transaction(func(tx *gorm.DB) error {

		id := r.FindActiveLogAksesByUserID(ctx, nil, userId)
		if id == 0 {
			if err := tx.Create(&logAkses).Error; err != nil {
				return err
			}

			detail := entity.DetailAkses{
				Activity:   "Login",
				LogAksesID: logAkses.ID,
				Status:     "200",
			}

			if err := tx.Create(&detail).Error; err != nil {
				return err
			}
		} else {
			detail := entity.DetailAkses{
				Activity:   "Login",
				LogAksesID: id,
				Status:     "200",
			}

			if err := tx.Create(&detail).Error; err != nil {
				return err
			}

		}

		return nil
	})

	if err != nil {
		return entity.LogAkses{}, err
	}

	return logAkses, nil
}

func (r *logAksesRepository) GetAllLogAkses(ctx context.Context, filter dto.LogAksesPaginationRequest) (dto.LogAksesPaginationResponse, error) {
	var logAksesResponses []dto.LogAksesResponse

	var err error
	var count int64

	query := r.db.Table("detail_akses").
		Select("detail_akses.id, users.name, users.email, detail_akses.ip as ip_address, detail_akses.activity, detail_akses.token, detail_akses.created_at").
		Joins("JOIN log_akses ON log_akses.id = detail_akses.log_akses_id").
		Joins("JOIN users ON log_akses.user_id = users.id").
		Order("detail_akses.created_at ASC")

	loc, _ := time.LoadLocation("Asia/Jakarta")
	startDate, _ := time.Parse("2006-01-02", filter.StartDate)
	endDate, _ := time.Parse("2006-01-02", filter.EndDate)

	if !startDate.IsZero() {
		startDate = startDate.Add(-7 * time.Hour).In(loc)
	}

	if !endDate.IsZero() {
		endDate = endDate.Add(16*time.Hour + 59*time.Minute + 59*time.Second).In(loc)
	}

	if !startDate.IsZero() && !endDate.IsZero() {
		query = query.Where("detail_akses.created_at BETWEEN ? AND ?", startDate, endDate)
	}

	if !startDate.IsZero() && endDate.IsZero() {
		query = query.Where("detail_akses.created_at >= ?", startDate)
	}

	if startDate.IsZero() && !endDate.IsZero() {
		query = query.Where("detail_akses.created_at <= ?", endDate)
	}

	err = query.Count(&count).Error
	if err != nil {
		return dto.LogAksesPaginationResponse{}, err
	}

	err = query.Scan(&logAksesResponses).Error
	if err != nil {
		return dto.LogAksesPaginationResponse{}, err
	}

	return dto.LogAksesPaginationResponse{
		Data: logAksesResponses,
	}, nil
}
