package service

import (
	"bytes"
	"context"
	"fmt"
	"strconv"

	// "fmt"

	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"bumisubur-be/helpers"
	"bumisubur-be/repository"

	"github.com/xuri/excelize/v2"
)

type (
	UserService interface {
		RegisterUser(ctx context.Context, req dto.UserCreateRequest) (dto.UserResponse, error)
		GetAllUserWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.UserPaginationResponse, error)
		GetUserById(ctx context.Context, userId int) (dto.UserResponse, error)
		GetUserByEmail(ctx context.Context, email string) (dto.UserResponse, error)
		UpdateUser(ctx context.Context, req dto.UserCreateRequest, userId int) (dto.UserResponse, error)
		DeleteUser(ctx context.Context, userId int) error
		Verify(ctx context.Context, req dto.UserLoginRequest) (dto.UserLoginResponse, error)
		DownloadDataKaryawan(ctx context.Context) ([]byte, error)
	}

	userService struct {
		userRepo   repository.UserRepository
		logRepo    repository.LogAksesRepository
		jwtService JWTService
	}
)

func NewUserService(userRepo repository.UserRepository, logRepo repository.LogAksesRepository, jwtService JWTService) UserService {
	return &userService{
		userRepo:   userRepo,
		jwtService: jwtService,
		logRepo:    logRepo,
	}
}

const (
	LOCAL_URL          = "http://localhost:3000"
	VERIFY_EMAIL_ROUTE = "register/verify_email"
)

func (s *userService) RegisterUser(ctx context.Context, req dto.UserCreateRequest) (dto.UserResponse, error) {
	_, flag, _ := s.userRepo.CheckEmail(ctx, nil, req.Email)
	if flag {
		return dto.UserResponse{}, dto.ErrEmailAlreadyExists
	}

	user := entity.User{
		NIK:          req.NIK,
		Name:         req.Name,
		Email:        req.Email,
		NoHp:         req.NoHp,
		Password:     req.Password,
		Role:         req.Role,
		TanggalMasuk: req.TanggalMasuk,
		TempatLahir:  req.TempatLahir,
		TanggalLahir: req.TanggalLahir,
		Alamat:       req.Alamat,
	}

	userReg, err := s.userRepo.RegisterUser(ctx, nil, user)
	if err != nil {
		return dto.UserResponse{}, dto.ErrCreateUser
	}

	return dto.UserResponse{
		ID:           userReg.ID,
		NIK:          userReg.NIK,
		Name:         userReg.Name,
		Email:        userReg.Email,
		NoHp:         userReg.NoHp,
		Role:         userReg.Role,
		TanggalMasuk: userReg.TanggalMasuk.String(),
		TempatLahir:  userReg.TempatLahir,
		TanggalLahir: userReg.TanggalLahir.String(),
		Alamat:       userReg.Alamat,
	}, nil
}

func (s *userService) GetAllUserWithPagination(ctx context.Context, req dto.PaginationRequest) (dto.UserPaginationResponse, error) {
	dataWithPaginate, err := s.userRepo.GetAllUserWithPagination(ctx, nil, req)
	if err != nil {
		return dto.UserPaginationResponse{}, err
	}

	var datas []dto.UserResponse
	for _, user := range dataWithPaginate.Users {
		data := dto.UserResponse{
			ID:           user.ID,
			NIK:          user.NIK,
			Name:         user.Name,
			Email:        user.Email,
			NoHp:         user.NoHp,
			Role:         user.Role,
			TanggalMasuk: user.TanggalMasuk.String(),
		}

		datas = append(datas, data)
	}

	return dto.UserPaginationResponse{
		Data:           datas,
		Total_Karyawan: dataWithPaginate.Total_Karyawan,
		Total_Kasir:    dataWithPaginate.Total_Kasir,
		Total_Stok:     dataWithPaginate.Total_Stok,
		Total_Admin:    dataWithPaginate.Total_Admin,
		PaginationResponse: dto.PaginationResponse{
			Page:    dataWithPaginate.Page,
			PerPage: dataWithPaginate.PerPage,
			MaxPage: dataWithPaginate.MaxPage,
			Count:   dataWithPaginate.Count,
		},
	}, nil
}

func (s *userService) GetUserById(ctx context.Context, userId int) (dto.UserResponse, error) {
	user, err := s.userRepo.GetUserById(ctx, nil, userId)
	if err != nil {
		return dto.UserResponse{}, dto.ErrGetUserById
	}

	return dto.UserResponse{
		ID:           user.ID,
		NIK:          user.NIK,
		Name:         user.Name,
		Email:        user.Email,
		NoHp:         user.NoHp,
		Role:         user.Role,
		TanggalMasuk: user.TanggalMasuk.Format("2006-01-02"),
		TempatLahir:  user.TempatLahir,
		TanggalLahir: user.TanggalLahir.Format("2006-01-02"),
		Alamat:       user.Alamat,
	}, nil
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (dto.UserResponse, error) {
	emails, err := s.userRepo.GetUserByEmail(ctx, nil, email)
	if err != nil {
		return dto.UserResponse{}, dto.ErrGetUserByEmail
	}

	return dto.UserResponse{
		ID:           emails.ID,
		NIK:          emails.NIK,
		Name:         emails.Name,
		Email:        emails.Email,
		NoHp:         emails.NoHp,
		Role:         emails.Role,
		TanggalMasuk: emails.TanggalMasuk.String(),
		TempatLahir:  emails.TempatLahir,
		TanggalLahir: emails.TanggalLahir.String(),
		Alamat:       emails.Alamat,
	}, nil
}

func (s *userService) UpdateUser(ctx context.Context, req dto.UserCreateRequest, userId int) (dto.UserResponse, error) {
	user, err := s.userRepo.GetUserById(ctx, nil, userId)
	if err != nil {
		return dto.UserResponse{}, dto.ErrUserNotFound
	}

	hashedPassword, err := helpers.HashPassword(req.Password)
	if err != nil {
		return dto.UserResponse{}, err
	}

	data := entity.User{
		ID:           user.ID,
		NIK:          user.NIK,
		Name:         req.Name,
		Email:        req.Email,
		NoHp:         req.NoHp,
		Password:     hashedPassword,
		Role:         user.Role,
		TanggalMasuk: req.TanggalMasuk,
		TempatLahir:  req.TempatLahir,
		TanggalLahir: req.TanggalLahir,
		Alamat:       req.Alamat,
	}

	userUpdate, err := s.userRepo.UpdateUser(ctx, nil, data)
	if err != nil {
		return dto.UserResponse{}, dto.ErrUpdateUser
	}

	return dto.UserResponse{
		ID:           userUpdate.ID,
		NIK:          userUpdate.NIK,
		Name:         userUpdate.Name,
		Email:        userUpdate.Email,
		NoHp:         userUpdate.NoHp,
		Role:         userUpdate.Role,
		TanggalMasuk: userUpdate.TanggalMasuk.String(),
		TempatLahir:  userUpdate.TempatLahir,
		TanggalLahir: userUpdate.TanggalLahir.String(),
		Alamat:       userUpdate.Alamat,
	}, nil
}

func (s *userService) DeleteUser(ctx context.Context, userId int) error {
	user, err := s.userRepo.GetUserById(ctx, nil, userId)
	if err != nil {
		return dto.ErrUserNotFound
	}

	err = s.userRepo.DeleteUser(ctx, nil, user.ID)
	if err != nil {
		return dto.ErrDeleteUser
	}

	return nil
}

func (s *userService) Verify(ctx context.Context, req dto.UserLoginRequest) (dto.UserLoginResponse, error) {
	check, flag, err := s.userRepo.CheckEmail(ctx, nil, req.Email)
	if err != nil || !flag {
		return dto.UserLoginResponse{}, dto.ErrEmailNotFound
	}

	checkPassword, err := helpers.CheckPassword(check.Password, []byte(req.Password))
	if err != nil || !checkPassword {
		return dto.UserLoginResponse{}, dto.ErrPasswordNotMatch
	}

	token := s.jwtService.GenerateToken(strconv.Itoa(check.ID), check.Role)

	s.logRepo.LogAkses(ctx, nil, check.ID)

	return dto.UserLoginResponse{
		Token: token,
		Role:  check.Role,
	}, nil
}

func (s *userService) DownloadDataKaryawan(ctx context.Context) ([]byte, error) {
	
	karyawan, err := s.userRepo.GetAllUser(ctx, nil)
	if err != nil {
		return nil, err
	}

	f := excelize.NewFile()
	f.SetSheetName("Sheet1", "Data Karyawan")
	sheetIndex, err := f.GetSheetIndex("Data Karyawan")
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(sheetIndex)

	headers := []string{"ID", "NIK", "Nama", "Email", "No HP", "Jabatan", "Tanggal Masuk", "Tempat Lahir", "Tanggal Lahir", "Alamat"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c%d", 'A'+i, 1)
		f.SetCellValue("Data Karyawan", cell, header)
	}

	for i, user := range karyawan {
		f.SetCellValue("Data Karyawan", fmt.Sprintf("A%d", i+2), user.ID)
		f.SetCellValue("Data Karyawan", fmt.Sprintf("B%d", i+2), user.NIK)
		f.SetCellValue("Data Karyawan", fmt.Sprintf("C%d", i+2), user.Name)
		f.SetCellValue("Data Karyawan", fmt.Sprintf("D%d", i+2), user.Email)
		f.SetCellValue("Data Karyawan", fmt.Sprintf("E%d", i+2), user.NoHp)
		f.SetCellValue("Data Karyawan", fmt.Sprintf("F%d", i+2), user.Role)
		f.SetCellValue("Data Karyawan", fmt.Sprintf("G%d", i+2), user.TanggalMasuk.String())
		f.SetCellValue("Data Karyawan", fmt.Sprintf("H%d", i+2), user.TempatLahir)
		f.SetCellValue("Data Karyawan", fmt.Sprintf("I%d", i+2), user.TanggalLahir.String())
		f.SetCellValue("Data Karyawan", fmt.Sprintf("J%d", i+2), user.Alamat)
	}

	buf := new(bytes.Buffer)
	if err := f.Write(buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
