package service

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"bumisubur-be/repository"
	"bytes"
	"context"
	"fmt"

	"github.com/xuri/excelize/v2"
)

type (
	SupplierService interface {
		CreateSupplier(ctx context.Context, req dto.SupplierRequest) (dto.SupplierResponse, error)
		GetAllSupplier(ctx context.Context, req dto.PaginationRequest) (dto.GetAllSupplierResponse, error)
		GetSupplierByID(ctx context.Context, supplierID int) (dto.SupplierResponse, error)
		UpdateSupplier(ctx context.Context, req dto.SupplierRequest, supplierID int) (dto.SupplierResponse, error)
		UpdateSupplierSupply(ctx context.Context, req dto.UpdateSupplyRequest, supplierID int) (dto.SupplierResponse, error)
		DeleteSupplier(ctx context.Context, supplierID int) error
		Index(ctx context.Context) (dto.IndexResponse, error)

		CreateJenis(ctx context.Context, req dto.JenisRequest) (dto.JenisResponse, error)
		DeleteJenis(ctx context.Context, jenisID int) error
		GetAllJenis(ctx context.Context) ([]dto.JenisResponse, error)

		DownloadDataSupplier(ctx context.Context) ([]byte, error)
	}

	supplierService struct {
		supplierRepo repository.SupplierRepository
		jenisRepo    repository.JenisRepository
		merkRepo     repository.MerkRepository
		jwtService   JWTService
	}
)

func NewSupplierService(supplierRepo repository.SupplierRepository, jenisRepo repository.JenisRepository, merkRepo repository.MerkRepository, jwtService JWTService) SupplierService {
	return &supplierService{
		supplierRepo: supplierRepo,
		jenisRepo:    jenisRepo,
		merkRepo:     merkRepo,
		jwtService:   jwtService,
	}
}

func (s *supplierService) CreateSupplier(ctx context.Context, req dto.SupplierRequest) (dto.SupplierResponse, error) {
	_, flag, _ := s.supplierRepo.CheckSupplierName(ctx, nil, req.Name)
	if flag {
		return dto.SupplierResponse{}, dto.ErrSupplierAlreadyExists
	}

	supplierEntity := entity.Supplier{
		Name:     req.Name,
		NoHp:     req.NoHp,
		Discount: req.Discount,
	}

	supplier, err := s.supplierRepo.CreateSupplier(ctx, nil, supplierEntity)
	if err != nil {
		return dto.SupplierResponse{}, err
	}

	var merkResponses []dto.MerkResponse
	for _, merk := range req.MerkRequest {
		var jenisResponses []dto.JenisResponse

		merkEntity := entity.Merk{
			Nama: merk.NamaMerk,
		}

		merkRes, err := s.merkRepo.CreateMerk(ctx, nil, merkEntity)
		if err != nil {
			return dto.SupplierResponse{}, err
		}

		if len(merk.JenisRequest) == 0 {
			allJenis, err := s.jenisRepo.GetAllJenis(ctx, nil)
			if err != nil {
				return dto.SupplierResponse{}, err
			}

			for _, jenis := range allJenis {
				_, err = s.supplierRepo.CreateDetailMerkSupplier(ctx, nil, entity.DetailMerkSupplier{
					MerkID:     merkRes.ID,
					JenisID:    jenis.ID,
					SupplierID: supplier.ID,
					Discount:   merk.Discount,
				})

				if err != nil {
					continue
				}

				jenisResponses = append(jenisResponses, dto.JenisResponse{
					NamaJenis: jenis.NamaJenis,
				})
			}

		} else {
			for _, jenis := range merk.JenisRequest {
				jenisEntity := entity.Jenis{
					NamaJenis: jenis.NamaJenis,
				}

				jenis, err := s.jenisRepo.CreateJenis(ctx, nil, jenisEntity)
				if err != nil {
					continue
				}

				_, err = s.supplierRepo.CreateDetailMerkSupplier(ctx, nil, entity.DetailMerkSupplier{
					MerkID:     merkRes.ID,
					JenisID:    jenis.ID,
					SupplierID: supplier.ID,
					Discount:   merk.Discount,
				})

				if err != nil {
					continue
				}
				jenisResponses = append(jenisResponses, dto.JenisResponse{
					NamaJenis: jenis.NamaJenis,
				})
			}
		}

		merkResponses = append(merkResponses, dto.MerkResponse{
			NamaMerk: merk.NamaMerk,
			Discount: merk.Discount,
			Jenis:    jenisResponses,
		})
	}

	return dto.SupplierResponse{
		ID:       supplier.ID,
		Name:     supplier.Name,
		NoHp:     supplier.NoHp,
		Discount: supplier.Discount,
		Merk:     merkResponses,
	}, nil
}

func (s *supplierService) Index(ctx context.Context) (dto.IndexResponse, error) {
	merk, err := s.merkRepo.GetAllMerk(ctx, nil)
	if err != nil {
		return dto.IndexResponse{}, err
	}

	var merkResponses []dto.IndexMerk
	for _, merk := range merk {
		merkResponses = append(merkResponses, dto.IndexMerk{
			Merk: merk.Nama,
		})
	}

	jenis, err := s.jenisRepo.GetAllJenis(ctx, nil)
	if err != nil {
		return dto.IndexResponse{}, err
	}

	var jenisResponses []dto.IndexJenis
	for _, jenis := range jenis {
		jenisResponses = append(jenisResponses, dto.IndexJenis{
			Jenis: jenis.NamaJenis,
		})
	}

	res := dto.IndexResponse{
		Merk:  merkResponses,
		Jenis: jenisResponses,
	}

	return res, nil
}

func (s *supplierService) GetAllSupplier(ctx context.Context, req dto.PaginationRequest) (dto.GetAllSupplierResponse, error) {
	suppliers, err := s.supplierRepo.GetAllSupplierWithPagination(ctx, nil, req)
	if err != nil {
		return dto.GetAllSupplierResponse{}, err
	}

	responses := []dto.SupplierResponse{}
	for _, supplier := range suppliers.Data {
		supplierRes := dto.SupplierResponse{
			ID:       supplier.ID,
			Name:     supplier.Name,
			NoHp:     supplier.NoHp,
			Discount: supplier.Discount,
		}
		responses = append(responses, supplierRes)
	}

	return dto.GetAllSupplierResponse{
		Data: responses,
		PaginationResponse: dto.PaginationResponse{
			Page:    suppliers.Page,
			PerPage: suppliers.PerPage,
			MaxPage: suppliers.MaxPage,
			Count:   suppliers.Count,
		},
	}, nil
}

func (s *supplierService) GetSupplierByID(ctx context.Context, supplierID int) (dto.SupplierResponse, error) {

	supplier, err := s.supplierRepo.GetSupplierByID(ctx, nil, supplierID)
	if err != nil {
		return dto.SupplierResponse{}, err
	}

	response := dto.SupplierResponse{
		ID:       supplier.ID,
		Name:     supplier.Name,
		NoHp:     supplier.NoHp,
		Discount: supplier.Discount,
	}

	merks, err := s.supplierRepo.GetMerksBySupplierID(ctx, nil, supplier.ID)
	if err != nil {
		return dto.SupplierResponse{}, err
	}

	response.Merk = append(response.Merk, merks...)

	return response, nil
}

func (s *supplierService) UpdateSupplierSupply(ctx context.Context, req dto.UpdateSupplyRequest, supplierID int) (dto.SupplierResponse, error) {
	supplier, err := s.supplierRepo.GetSupplierByID(ctx, nil, supplierID)
	if err != nil {
		return dto.SupplierResponse{}, dto.ErrSupplierNotFound
	}

	err = s.supplierRepo.DeleteDetailMerkSupplier(ctx, nil, supplierID)
	if err != nil {
		return dto.SupplierResponse{}, err
	}

	var merkResponses []dto.MerkResponse

	for _, merk := range req.Data {
		var jenisResponses []dto.JenisResponse

		merkEntity := entity.Merk{
			Nama: merk.NamaMerk,
		}

		merkRes, err := s.merkRepo.CreateMerk(ctx, nil, merkEntity)
		if err != nil {
			return dto.SupplierResponse{}, err
		}

		if len(merk.JenisRequest) == 0 {
			allJenis, err := s.jenisRepo.GetAllJenis(ctx, nil)
			if err != nil {
				return dto.SupplierResponse{}, err
			}

			for _, jenis := range allJenis {
				_, err = s.supplierRepo.CreateDetailMerkSupplier(ctx, nil, entity.DetailMerkSupplier{
					MerkID:     merkRes.ID,
					JenisID:    jenis.ID,
					SupplierID: supplier.ID,
					Discount:   merk.Discount,
				})
				if err != nil {
					continue
				}

				jenisResponses = append(jenisResponses, dto.JenisResponse{
					NamaJenis: jenis.NamaJenis,
				})
			}
		} else {
			for _, jenis := range merk.JenisRequest {
				jenisEntity := entity.Jenis{
					NamaJenis: jenis.NamaJenis,
				}

				createdJenis, err := s.jenisRepo.CreateJenis(ctx, nil, jenisEntity)
				if err != nil {
					continue
				}

				_, err = s.supplierRepo.CreateDetailMerkSupplier(ctx, nil, entity.DetailMerkSupplier{
					MerkID:     merkRes.ID,
					JenisID:    createdJenis.ID,
					SupplierID: supplier.ID,
					Discount:   merk.Discount,
				})

				if err != nil {
					continue
				}

				jenisResponses = append(jenisResponses, dto.JenisResponse{
					NamaJenis: createdJenis.NamaJenis,
				})
			}
		}

		merkResponses = append(merkResponses, dto.MerkResponse{
			NamaMerk: merk.NamaMerk,
			Discount: merk.Discount,
			Jenis:    jenisResponses,
		})
	}

	return dto.SupplierResponse{
		ID:       supplier.ID,
		Name:     supplier.Name,
		NoHp:     supplier.NoHp,
		Discount: supplier.Discount,
		Merk:     merkResponses,
	}, nil
}

func (s *supplierService) UpdateSupplier(ctx context.Context, req dto.SupplierRequest, supplierID int) (dto.SupplierResponse, error) {

	updateSupplier := entity.Supplier{
		ID:       supplierID,
		Name:     req.Name,
		NoHp:     req.NoHp,
		Discount: req.Discount,
	}

	supplierUpdate, err := s.supplierRepo.UpdateSupplier(ctx, nil, updateSupplier)
	if err != nil {
		return dto.SupplierResponse{}, dto.ErrUpdateSupplier
	}

	err = s.supplierRepo.DeleteDetailMerkSupplier(ctx, nil, supplierID)
	if err != nil {
		return dto.SupplierResponse{}, err
	}

	var merkResponses []dto.MerkResponse
	for _, merk := range req.MerkRequest {
		var jenisResponses []dto.JenisResponse

		merkEntity := entity.Merk{
			Nama: merk.NamaMerk,
		}

		merkRes, err := s.merkRepo.CreateMerk(ctx, nil, merkEntity)
		if err != nil {
			return dto.SupplierResponse{}, err
		}

		for _, jenis := range merk.JenisRequest {
			jenisEntity := entity.Jenis{
				NamaJenis: jenis.NamaJenis,
			}

			jenis, err := s.jenisRepo.CreateJenis(ctx, nil, jenisEntity)
			if err != nil {
				continue
			}

			_, err = s.supplierRepo.CreateDetailMerkSupplier(ctx, nil, entity.DetailMerkSupplier{
				MerkID:     merkRes.ID,
				JenisID:    jenis.ID,
				SupplierID: supplierID,
				Discount:   merk.Discount,
			})

			if err != nil {
				continue
			}

			jenisResponses = append(jenisResponses, dto.JenisResponse{
				NamaJenis: jenis.NamaJenis,
			})
		}

		merkResponses = append(merkResponses, dto.MerkResponse{
			NamaMerk: merk.NamaMerk,
			Discount: merk.Discount,
			Jenis:    jenisResponses,
		})
	}

	return dto.SupplierResponse{
		ID:       supplierUpdate.ID,
		Name:     supplierUpdate.Name,
		NoHp:     supplierUpdate.NoHp,
		Discount: supplierUpdate.Discount,
		Merk:     merkResponses,
	}, nil
}

func (s *supplierService) DeleteSupplier(ctx context.Context, supplierID int) error {
	supplier, err := s.supplierRepo.GetSupplierByID(ctx, nil, supplierID)
	if err != nil {
		return dto.ErrSupplierNotFound
	}

	err = s.supplierRepo.DeleteSupplier(ctx, nil, supplier.ID)
	if err != nil {
		return dto.ErrDeleteSupplier
	}

	return nil
}

func (s *supplierService) CreateJenis(ctx context.Context, req dto.JenisRequest) (dto.JenisResponse, error) {
	jenisEntity := entity.Jenis{
		NamaJenis: req.NamaJenis,
	}

	jenis, err := s.jenisRepo.CreateJenis(ctx, nil, jenisEntity)
	if err != nil {
		return dto.JenisResponse{}, err
	}

	return dto.JenisResponse{
		ID:        jenis.ID,
		NamaJenis: jenis.NamaJenis,
	}, nil
}

func (s *supplierService) DeleteJenis(ctx context.Context, jenisID int) error {
	jenis, err := s.jenisRepo.GetJenisByID(ctx, nil, jenisID)
	if err != nil {
		return dto.ErrJenisNotFound
	}

	err = s.jenisRepo.DeleteJenis(ctx, nil, jenis.ID)
	if err != nil {
		return dto.ErrDeleteJenis
	}

	return nil
}

func (s *supplierService) GetAllJenis(ctx context.Context) ([]dto.JenisResponse, error) {
	jenis, err := s.jenisRepo.GetAllJenis(ctx, nil)
	if err != nil {
		return []dto.JenisResponse{}, err
	}

	responses := []dto.JenisResponse{}
	for _, jenis := range jenis {
		responses = append(responses, dto.JenisResponse{
			ID:        jenis.ID,
			NamaJenis: jenis.NamaJenis,
		})
	}

	return responses, nil
}

func (s *supplierService) DownloadDataSupplier(ctx context.Context) ([]byte, error) {
	suppliers, err := s.supplierRepo.GetAllSupplier(ctx, nil)
	if err != nil {
		return nil, err
	}

	f := excelize.NewFile()
	f.SetSheetName("Sheet1", "Data Supplier")
	sheetIndex, err := f.GetSheetIndex("Data Supplier")
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(sheetIndex)

	headers := []string{"ID", "Nama Supplier", "No.HP"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c%d", 'A'+i, 1)
		f.SetCellValue("Data Cabasupplierng", cell, header)
	}

	for i, supplier := range suppliers {
		f.SetCellValue("Data Cabang", fmt.Sprintf("A%d", i+2), supplier.ID)
		f.SetCellValue("Data supplier", fmt.Sprintf("B%d", i+2), supplier.Name)
		f.SetCellValue("Data supplier", fmt.Sprintf("C%d", i+2), supplier.NoHp)
	}

	// Save Excel content to a buffer
	buf := new(bytes.Buffer)
	if err := f.Write(buf); err != nil {
		return nil, err
	}

	// Return the buffer's bytes
	return buf.Bytes(), nil
}
