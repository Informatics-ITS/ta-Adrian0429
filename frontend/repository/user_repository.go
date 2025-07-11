package repository

import (
	"context"
	"math"

	"bumisubur-be/dto"
	"bumisubur-be/entity"

	"gorm.io/gorm"
)

type (
	UserRepository interface {
		RegisterUser(ctx context.Context, tx *gorm.DB, user entity.User) (entity.User, error)
		GetAllUserWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.GetAllUserRepositoryResponse, error)
		GetAllUser(ctx context.Context, tx *gorm.DB) ([]entity.User, error)
		GetUserById(ctx context.Context, tx *gorm.DB, userId int) (entity.User, error)
		GetUserByEmail(ctx context.Context, tx *gorm.DB, email string) (entity.User, error)
		CheckEmail(ctx context.Context, tx *gorm.DB, email string) (entity.User, bool, error)
		UpdateUser(ctx context.Context, tx *gorm.DB, user entity.User) (entity.User, error)
		DeleteUser(ctx context.Context, tx *gorm.DB, userId int) error
	}

	userRepository struct {
		db *gorm.DB
	}
)

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		db: db,
	}
}

func (r *userRepository) RegisterUser(ctx context.Context, tx *gorm.DB, user entity.User) (entity.User, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Create(&user).Error; err != nil {
		return entity.User{}, err
	}

	return user, nil
}

func (r *userRepository) GetAllUser(ctx context.Context, tx *gorm.DB) ([]entity.User, error) {
	var users []entity.User
	err := r.db.WithContext(ctx).Find(&users).Error
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepository) GetAllUserWithPagination(ctx context.Context, tx *gorm.DB, req dto.PaginationRequest) (dto.GetAllUserRepositoryResponse, error) {
	if tx == nil {
		tx = r.db
	}

	var users []entity.User
	var err error
	var count int64
	var countKasir int64
	var countStok int64

	if req.PerPage == 0 {
		req.PerPage = 10
	}
	if req.Page == 0 {
		req.Page = 1
	}

	query := tx.WithContext(ctx).Model(&entity.User{}).Where("role != ?", "owner")

	if req.Search != "" {
		query = query.Where("name LIKE ?", "%"+req.Search+"%")
	}

	err = query.Count(&count).Error
	if err != nil {
		return dto.GetAllUserRepositoryResponse{}, err
	}

	err = tx.Model(&entity.User{}).Where("role = ?", "kasir").Count(&countKasir).Error
	if err != nil {
		return dto.GetAllUserRepositoryResponse{}, err
	}

	err = tx.Model(&entity.User{}).Where("role = ?", "stok").Count(&countStok).Error
	if err != nil {
		return dto.GetAllUserRepositoryResponse{}, err
	}

	offset := (req.Page - 1) * req.PerPage
	maxPage := int64(math.Ceil(float64(count) / float64(req.PerPage)))

	err = query.Order("created_at ASC").Offset(offset).Limit(req.PerPage).Find(&users).Error
	if err != nil {
		return dto.GetAllUserRepositoryResponse{}, err
	}

	return dto.GetAllUserRepositoryResponse{
		Users:          users,
		Total_Karyawan: count,
		Total_Kasir:    countKasir,
		Total_Stok:     countStok,
		Total_Admin:    count - countKasir - countStok,
		PaginationResponse: dto.PaginationResponse{
			Page:    req.Page,
			PerPage: req.PerPage,
			MaxPage: maxPage,
			Count:   count,
		},
	}, nil
}

func (r *userRepository) GetUserById(ctx context.Context, tx *gorm.DB, userId int) (entity.User, error) {
	if tx == nil {
		tx = r.db
	}

	var user entity.User
	if err := tx.WithContext(ctx).Where("id = ?", userId).Take(&user).Error; err != nil {
		return entity.User{}, err
	}

	return user, nil
}

func (r *userRepository) GetUserByEmail(ctx context.Context, tx *gorm.DB, email string) (entity.User, error) {
	if tx == nil {
		tx = r.db
	}

	var user entity.User
	if err := tx.WithContext(ctx).Where("email = ?", email).Take(&user).Error; err != nil {
		return entity.User{}, err
	}

	return user, nil
}

func (r *userRepository) CheckEmail(ctx context.Context, tx *gorm.DB, email string) (entity.User, bool, error) {
	if tx == nil {
		tx = r.db
	}

	var user entity.User
	if err := tx.WithContext(ctx).Where("email = ?", email).Take(&user).Error; err != nil {
		return entity.User{}, false, err
	}

	return user, true, nil
}

func (r *userRepository) UpdateUser(ctx context.Context, tx *gorm.DB, user entity.User) (entity.User, error) {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Updates(&user).Error; err != nil {
		return entity.User{}, err
	}

	return user, nil
}

func (r *userRepository) DeleteUser(ctx context.Context, tx *gorm.DB, userId int) error {
	if tx == nil {
		tx = r.db
	}

	if err := tx.WithContext(ctx).Delete(&entity.User{}, "id = ?", userId).Error; err != nil {
		return err
	}

	return nil
}
