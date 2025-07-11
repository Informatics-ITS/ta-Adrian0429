package dto

import (
	"errors"
	"time"

	"bumisubur-be/entity"
)

const (
	// Failed
	MESSAGE_FAILED_GET_DATA_FROM_BODY           = "gagal mendapatkan data dari body"
	MESSAGE_FAILED_REGISTER_USER                = "gagal mendaftarkan akun baru"
	MESSAGE_FAILED_GET_LIST_USER                = "gagal mengambil semua data user"
	MESSAGE_FAILED_GET_USER_TOKEN               = "gagal mendapatkan token"
	MESSAGE_FAILED_TOKEN_NOT_VALID              = "token tidak valid"
	MESSAGE_FAILED_TOKEN_NOT_FOUND              = "token tidak ditemukan"
	MESSAGE_FAILED_GET_USER                     = "gagal mendapatkan data user"
	MESSAGE_FAILED_LOGIN                        = "Gagal login"
	MESSAGE_FAILED_WRONG_EMAIL_OR_PASSWORD      = "email atau password salah"
	MESSAGE_FAILED_UPDATE_USER                  = "gagal memperbarui data user"
	MESSAGE_FAILED_DELETE_USER                  = "gagal menghapus user"
	MESSAGE_FAILED_PROSES_REQUEST               = "gagal memproses request"
	MESSAGE_FAILED_DENIED_ACCESS                = "akses ditolak"
	MESSAGE_FAILED_VERIFY_EMAIL                 = "gagal verifikasi email"
	MESSAGE_FAILED_UPDATE_DETAILED_PRODUK_BY_ID = "gagal memperbarui pending produk"
	MESSAGE_FAILED_GET_TRANSAKSI_BY_NOTA_ID     = "gagal mendapatkan transaksi berdasarkan nota id"

	// Success
	MESSAGE_SUCCESS_REGISTER_USER                = "sukses mendaftarkan akun baru"
	MESSAGE_SUCCESS_GET_LIST_USER                = "sukses mengambil semua data user"
	MESSAGE_SUCCESS_GET_USER                     = "sukses mendapatkan data user"
	MESSAGE_SUCCESS_LOGIN                        = "sukses login"
	MESSAGE_SUCCESS_UPDATE_USER                  = "sukses memperbarui data user"
	MESSAGE_SUCCESS_DELETE_USER                  = "sukses menghapus user"
	MESSAGE_SEND_VERIFICATION_EMAIL_SUCCESS      = "sukses mengirim email verifikasi"
	MESSAGE_SUCCESS_VERIFY_EMAIL                 = "sukses verifikasi email"
	MESSAGE_SUCCESS_UPDATE_DETAILED_PRODUK_BY_ID = "sukses memperbarui pending produk"
	MESSAGE_SUCCESS_GET_TRANSAKSI_BY_NOTA_ID     = "sukses mendapatkan transaksi berdasarkan nota id"
)

var (
	ErrCreateUser             = errors.New("gagal mendaftarkan akun baru")
	ErrGetAllUser             = errors.New("gagal mengambil semua data user")
	ErrGetUserById            = errors.New("gagal mengambil data user berdasarkan id")
	ErrGetUserByEmail         = errors.New("gagal mengambil data user berdasarkan email")
	ErrEmailAlreadyExists     = errors.New("email sudah terdaftar")
	ErrUpdateUser             = errors.New("gagal memperbarui data user")
	ErrUserNotAdmin           = errors.New("user bukan admin")
	ErrUserNotFound           = errors.New("user tidak ditemukan")
	ErrEmailNotFound          = errors.New("email tidak ditemukan")
	ErrDeleteUser             = errors.New("gagal menghapus user")
	ErrPasswordNotMatch       = errors.New("password tidak cocok")
	ErrEmailOrPassword        = errors.New("email atau password salah")
	ErrAccountNotVerified     = errors.New("akun belum terverifikasi")
	ErrTokenInvalid           = errors.New("token tidak valid")
	ErrTokenExpired           = errors.New("token kadaluarsa")
	ErrAccountAlreadyVerified = errors.New("akun sudah terverifikasi")
)

type (
	UserCreateRequest struct {
		NIK          string    `json:"nik" form:"nik" binding:"required"`
		Name         string    `json:"name" form:"name" binding:"required"`
		Password     string    `json:"password" form:"password" binding:"required"`
		Email        string    `json:"email" form:"email" binding:"required"`
		NoHp         string    `json:"no_hp" form:"no_hp" binding:"required"`
		Role         string    `json:"role" form:"role" binding:"required"`
		TanggalMasuk time.Time `json:"tanggal_masuk" form:"tanggal_masuk" binding:"required"`
		TempatLahir  string    `json:"tempat_lahir" form:"tempat_lahir" binding:"required"`
		TanggalLahir time.Time `json:"tanggal_lahir" form:"tanggal_lahir" binding:"required"`
		Alamat       string    `json:"alamat" form:"alamat" binding:"required"`
	}

	UserResponse struct {
		ID           int    `json:"id"`
		NIK          string `json:"nik"`
		Name         string `json:"name"`
		Email        string `json:"email"`
		NoHp         string `json:"no_hp"`
		Role         string `json:"role"`
		TanggalMasuk string `json:"tanggal_masuk"`
		TempatLahir  string `json:"tempat_lahir"`
		TanggalLahir string `json:"tanggal_lahir"`
		Alamat       string `json:"alamat"`
	}

	UserPaginationResponse struct {
		Data []UserResponse `json:"data"`

		Total_Karyawan int64 `json:"total_karyawan"`
		Total_Kasir    int64 `json:"total_kasir"`
		Total_Stok     int64 `json:"total_stok"`
		Total_Admin    int64 `json:"total_admin"`
		PaginationResponse
	}

	GetAllUserRepositoryResponse struct {
		Users []entity.User

		Total_Karyawan int64 `json:"total_karyawan"`
		Total_Kasir    int64 `json:"total_kasir"`
		Total_Stok     int64 `json:"total_stok"`
		Total_Admin    int64 `json:"total_admin"`

		PaginationResponse
	}

	UserUpdateRequest struct {
		Name   string `json:"name" form:"name" binding:"required"`
		Email  string `json:"email" form:"email" binding:"required"`
		NoHp   string `json:"no_hp" form:"no_hp" binding:"required"`
		Alamat string `json:"alamat" form:"alamat" binding:"required"`
	}

	SendVerificationEmailRequest struct {
		Email string `json:"email" form:"email" binding:"required"`
	}

	VerifyEmailRequest struct {
		Token string `json:"token" form:"token" binding:"required"`
	}

	VerifyEmailResponse struct {
		Email      string `json:"email"`
		IsVerified bool   `json:"is_verified"`
	}

	UserLoginRequest struct {
		Email    string `json:"email" form:"email" binding:"required"`
		Password string `json:"password" form:"password" binding:"required"`
	}

	UserLoginResponse struct {
		Token string `json:"token"`
		Role  string `json:"role"`
	}

	UpdateStatusIsVerifiedRequest struct {
		UserId     string `json:"user_id" form:"user_id" binding:"required"`
		IsVerified bool   `json:"is_verified" form:"is_verified"`
	}
)
