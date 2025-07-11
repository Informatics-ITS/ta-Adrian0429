package service

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"bumisubur-be/repository"
	"bumisubur-be/utils"
	"context"
	"errors"
	"fmt"
	"log"
	"time"
)

type ProdukService interface {
	IndexRestokProduk(ctx context.Context) (dto.IndexRestok, error)
	CreateProduk(ctx context.Context, produk dto.ProdukRequest) (dto.CreateProdukResponse, error)

	IndexRestokOldProduk(ctx context.Context) ([]dto.IndexRestokOld, error)
	CreateOldProduk(ctx context.Context, produk dto.OldProdukRequest) (dto.CreateProdukResponse, error)

	GetAllProdukWithPagination(ctx context.Context, req dto.ProdukPaginationRequest) (dto.GetAllProdukResponse, error)

	GetProdukDetails(ctx context.Context, produkID string) (dto.ProdukDetails, error)

	GetPendingProduks(ctx context.Context) ([]dto.PendingStok, error)
	GetDetailedPendingProduks(ctx context.Context, restokID string) (dto.PendingStok, error)
	UpdateDetailedPendingProduks(ctx context.Context, produk dto.EditPendingRestok) (dto.PendingStok, error)
	DeleteDetailedPendingProduks(ctx context.Context, produkID string) error

	GetAllRestokWithPagination(ctx context.Context, req dto.RestokProdukPaginationRequest) ([]dto.RestokDTO, error)

	GetIndexFinalStok(ctx context.Context) (dto.IndexFinalStok, error)
	FinalStokProduk(ctx context.Context, filter dto.FilterFinalStok) (any, error)
	InsertProduk(ctx context.Context, restokID string) (entity.Produk, error)
}

type produkService struct {
	produkRepo   repository.ProdukRepository
	jenisRepo    repository.JenisRepository
	merkRepo     repository.MerkRepository
	supplierRepo repository.SupplierRepository
}

func NewProdukService(produkRepo repository.ProdukRepository, jenisRepo repository.JenisRepository, merkRepo repository.MerkRepository, supplierRepo repository.SupplierRepository) ProdukService {
	return &produkService{
		produkRepo:   produkRepo,
		jenisRepo:    jenisRepo,
		merkRepo:     merkRepo,
		supplierRepo: supplierRepo,
	}
}

func (s *produkService) IndexRestokProduk(ctx context.Context) (dto.IndexRestok, error) {
	suppliers, err := s.supplierRepo.GetAllSupplier(ctx, nil)
	if err != nil {
		return dto.IndexRestok{}, err
	}

	cabangs, err := s.produkRepo.GetAllCabang(ctx, nil)
	if err != nil {
		return dto.IndexRestok{}, err
	}

	var detailIndexList []dto.DetailIndex

	for _, supplier := range suppliers {
		detailMerkSuppliers, err := s.produkRepo.GetDetailMerkSuppliersBySupplierID(ctx, supplier.ID)
		if err != nil {
			return dto.IndexRestok{}, err
		}

		supplyMap := make(map[int]*dto.Supply)
		for _, detailMerkSupplier := range detailMerkSuppliers {
			merk, err := s.merkRepo.GetMerkByID(ctx, nil, detailMerkSupplier.MerkID)
			if err != nil {
				return dto.IndexRestok{}, err
			}

			jenis, err := s.jenisRepo.GetJenisByID(ctx, nil, detailMerkSupplier.JenisID)
			if err != nil {
				return dto.IndexRestok{}, err
			}

			jenisSupply := dto.JenisSupply{
				JenisId: jenis.ID,
				Jenis:   jenis.NamaJenis,
			}

			if supply, exists := supplyMap[merk.ID]; exists {
				supply.Jenis = append(supply.Jenis, jenisSupply)
			} else {
				supplyMap[merk.ID] = &dto.Supply{
					MerkId: merk.ID,
					Merk:   merk.Nama,
					Jenis:  []dto.JenisSupply{jenisSupply},
				}
			}
		}

		var supplyList []dto.Supply
		for _, supply := range supplyMap {
			supplyList = append(supplyList, *supply)
		}

		detailIndex := dto.DetailIndex{
			Supplier: supplier,
			Supply:   supplyList,
		}

		detailIndexList = append(detailIndexList, detailIndex)
	}

	return dto.IndexRestok{
		Data:   detailIndexList,
		Cabang: cabangs,
	}, nil
}

func (s *produkService) CreateProduk(ctx context.Context, produk dto.ProdukRequest) (dto.CreateProdukResponse, error) {
	existingProduk, err := s.produkRepo.GetProdukByBarcodeID(ctx, produk.BarcodeId)
	if err != nil {
		return dto.CreateProdukResponse{}, err
	}
	if existingProduk.ID != 0 {
		return dto.CreateProdukResponse{}, errors.New("product with the same barcode ID already exists")
	}

	DetailMerkSupply, err := s.produkRepo.GetDetailMerkSupplier(ctx, nil, produk.MerkId, produk.JenisId, produk.SupplierId)
	if err != nil {
		return dto.CreateProdukResponse{}, err
	}

	tanggalRestok := utils.ParseDate(produk.TanggalRestok)

	produkEntity := entity.Produk{
		NamaProduk: produk.NamaProduk,
		BarcodeID:  produk.BarcodeId,
		CabangID:   produk.CabangId,
		HargaJual:  produk.HargaJual,
	}

	createdProduk, err := s.produkRepo.CreateProduk(ctx, nil, produkEntity)
	if err != nil {
		return dto.CreateProdukResponse{}, err
	}

	restokEntity := entity.Restok{
		SupplierID:    produk.SupplierId,
		ProdukID:      createdProduk.ID,
		TanggalRestok: tanggalRestok,
	}

	Restok, err := s.produkRepo.CreateRestok(ctx, nil, restokEntity)
	if err != nil {
		log.Printf("Error creating Restok: %v\n", err)
		return dto.CreateProdukResponse{}, err
	}

	var details []dto.DetailProdukResponse

	for _, item := range produk.Detail {
		produkItemEntity := entity.DetailProduk{
			ProdukID:             createdProduk.ID,
			DetailMerkSupplierID: DetailMerkSupply.DetailMerkSupplierID,
			Ukuran:               item.Ukuran,
			Stok:                 item.Stok,
			Warna:                item.Warna,
			Status:               0,
			HargaBeli:            createdProduk.HargaJual - (createdProduk.HargaJual * (float64(DetailMerkSupply.Discount) / 100)),
		}

		createdDetailProduk, err := s.produkRepo.CreateDetailProduk(ctx, nil, produkItemEntity)
		if err != nil {
			log.Printf("Error creating DetailProduk: %v\n", err)
			return dto.CreateProdukResponse{}, err
		}

		detailRestok := entity.DetailRestok{
			Jumlah:         item.Stok,
			RestokID:       Restok.ID,
			DetailProdukID: createdDetailProduk.ID,
		}

		_, err = s.produkRepo.CreateDetailRestok(ctx, nil, detailRestok)
		if err != nil {
			log.Printf("Error creating DetailRestok: %v\n", err)
			return dto.CreateProdukResponse{}, err
		}

		detailResponse := dto.DetailProdukResponse{
			Ukuran:    createdDetailProduk.Ukuran,
			Stok:      createdDetailProduk.Stok,
			Warna:     createdDetailProduk.Warna,
			BarcodeID: createdProduk.BarcodeID,
		}

		details = append(details, detailResponse)
	}

	produkResponse := dto.CreateProdukResponse{
		ID:            createdProduk.ID,
		NamaProduk:    createdProduk.NamaProduk,
		BarcodeID:     createdProduk.BarcodeID,
		HargaJual:     createdProduk.HargaJual,
		TanggalRestok: tanggalRestok,
		Details:       details,
	}

	return produkResponse, nil
}

func (s *produkService) CreateOldProduk(ctx context.Context, produk dto.OldProdukRequest) (dto.CreateProdukResponse, error) {
	Produk, err := s.produkRepo.GetProdukByID(ctx, produk.ProdukId)
	if err != nil {
		return dto.CreateProdukResponse{}, err
	}

	tanggalRestok := utils.ParseDate(produk.TanggalRestok)

	entityProduk := entity.Produk{
		ID:         Produk.ID,
		NamaProduk: Produk.NamaProduk,
		BarcodeID:  Produk.BarcodeID,
		CabangID:   Produk.CabangID,
		HargaJual:  produk.HargaJual,
	}

	Produk, err = s.produkRepo.UpdateProduk(ctx, nil, entityProduk)
	if err != nil {
		return dto.CreateProdukResponse{}, err
	}

	restokEntity := entity.Restok{
		SupplierID:    produk.SupplierId,
		ProdukID:      Produk.ID,
		TanggalRestok: tanggalRestok,
	}

	Restok, err := s.produkRepo.CreateRestok(ctx, nil, restokEntity)
	if err != nil {
		return dto.CreateProdukResponse{}, err
	}

	DetailMerkSupply, err := s.produkRepo.GetDetailMerkSupplier(ctx, nil, produk.MerkId, produk.JenisId, produk.SupplierId)
	if err != nil {
		return dto.CreateProdukResponse{}, err
	}

	var details []dto.DetailProdukResponse

	for _, item := range produk.Details {
		produkItemEntity := entity.DetailProduk{
			ProdukID:             Produk.ID,
			DetailMerkSupplierID: DetailMerkSupply.DetailMerkSupplierID,
			Ukuran:               item.Ukuran,
			Stok:                 item.Stok,
			Warna:                item.Warna,
			HargaBeli:            Produk.HargaJual - (Produk.HargaJual * (float64(DetailMerkSupply.Discount) / 100)),
			Status:               0,
		}

		createdDetailProduk, err := s.produkRepo.CreateDetailProduk(ctx, nil, produkItemEntity)
		if err != nil {
			return dto.CreateProdukResponse{}, err
		}

		detailRestok := entity.DetailRestok{
			Jumlah:         item.Stok,
			RestokID:       Restok.ID,
			DetailProdukID: createdDetailProduk.ID,
		}

		_, err = s.produkRepo.CreateDetailRestok(ctx, nil, detailRestok)
		if err != nil {
			log.Printf("Error creating DetailRestok: %v\n", err)
			return dto.CreateProdukResponse{}, err
		}

		detailResponse := dto.DetailProdukResponse{
			Ukuran:    createdDetailProduk.Ukuran,
			Stok:      createdDetailProduk.Stok,
			Warna:     createdDetailProduk.Warna,
			BarcodeID: Produk.BarcodeID,
		}

		details = append(details, detailResponse)
	}

	produkResponse := dto.CreateProdukResponse{
		ID:            Produk.ID,
		NamaProduk:    Produk.NamaProduk,
		BarcodeID:     Produk.BarcodeID,
		HargaJual:     Produk.HargaJual,
		TanggalRestok: tanggalRestok,
		Details:       details,
	}

	return produkResponse, nil
}

func (s *produkService) GetAllProdukWithPagination(ctx context.Context, req dto.ProdukPaginationRequest) (dto.GetAllProdukResponse, error) {
	produkList, err := s.produkRepo.GetAllProdukWithPagination(ctx, req)
	if err != nil {
		return dto.GetAllProdukResponse{}, err
	}

	return produkList, nil
}

func (s *produkService) UpdateDetailedPendingProduks(ctx context.Context, produk dto.EditPendingRestok) (dto.PendingStok, error) {

	err := s.produkRepo.DeleteDetailPendingOnly(ctx, nil, produk.RestokID)
	if err != nil {
		return dto.PendingStok{}, err
	}

	Produk, err := s.produkRepo.GetProdukByID(ctx, produk.ProdukId)
	if err != nil {
		return dto.PendingStok{}, err
	}

	produkEntity := entity.Produk{
		ID:         Produk.ID,
		NamaProduk: Produk.NamaProduk,
		BarcodeID:  Produk.BarcodeID,
		CabangID:   produk.CabangId,
		HargaJual:  produk.HargaJual,
	}

	Produk, err = s.produkRepo.UpdateProduk(ctx, nil, produkEntity)
	if err != nil {
		return dto.PendingStok{}, err
	}

	DetailMerkSupply, err := s.produkRepo.GetDetailMerkSupplier(ctx, nil, produk.MerkId, produk.JenisId, produk.SupplierId)
	if err != nil {
		return dto.PendingStok{}, err
	}

	for _, item := range produk.Details {

		newDetailProduk := entity.DetailProduk{
			Ukuran:               item.Ukuran,
			Warna:                item.Warna,
			Stok:                 item.Stok,
			ProdukID:             Produk.ID,
			DetailMerkSupplierID: DetailMerkSupply.DetailMerkSupplierID,
			HargaBeli:            Produk.HargaJual - (Produk.HargaJual * (float64(DetailMerkSupply.Discount) / 100)),
			Status:               0,
		}

		createdDetailProduk, err := s.produkRepo.CreateDetailProduk(ctx, nil, newDetailProduk)
		if err != nil {
			return dto.PendingStok{}, err
		}

		detailRestok := entity.DetailRestok{
			Jumlah:         item.Stok,
			RestokID:       produk.RestokID,
			DetailProdukID: createdDetailProduk.ID,
		}

		_, err = s.produkRepo.CreateDetailRestok(ctx, nil, detailRestok)
		if err != nil {
			log.Printf("Error creating DetailRestok: %v\n", err)
			return dto.PendingStok{}, err
		}

	}

	return dto.PendingStok{}, nil
}

func (s *produkService) DeleteDetailedPendingProduks(ctx context.Context, produkID string) error {
	err := s.produkRepo.DeleteDetailedPendingProduks(ctx, nil, produkID)
	if err != nil {
		return err
	}

	return nil
}

func (s *produkService) IndexRestokOldProduk(ctx context.Context) ([]dto.IndexRestokOld, error) {
	var result []dto.IndexRestokOld

	existingProduk, err := s.produkRepo.GetRestokOldProduk(ctx)
	if err != nil {
		return nil, err
	}

	for _, produk := range existingProduk {
		possibleMerksRepo, err := s.produkRepo.GetPossibleMerks(ctx, produk.ProdukId)
		if err != nil {
			return nil, err
		}

		var possibleMerks []dto.PossibleMerk
		for _, merkRepo := range possibleMerksRepo {

			possibleSuppliers, err := s.produkRepo.GetPossibleProdukSupplier(ctx, merkRepo.MerkId, produk.JenisId)
			if err != nil {
				return nil, err
			}

			possibleMerks = append(possibleMerks, dto.PossibleMerk{
				MerkId:           merkRepo.MerkId,
				Merk:             merkRepo.Merk,
				PossibleSupplier: possibleSuppliers,
			})
		}

		result = append(result, dto.IndexRestokOld{
			Produks:      produk,
			PossibleMerk: possibleMerks,
		})
	}

	return result, nil
}

func (s *produkService) GetProdukDetails(ctx context.Context, produkID string) (dto.ProdukDetails, error) {

	produk, err := s.produkRepo.GetProdukDetails(ctx, nil, produkID)
	if err != nil {
		return dto.ProdukDetails{}, err
	}

	return produk, nil
}

func (s *produkService) GetPendingProduks(ctx context.Context) ([]dto.PendingStok, error) {
	produkList, err := s.produkRepo.GetPendingProduks(ctx, nil)
	if err != nil {
		return []dto.PendingStok{}, err
	}

	return produkList, nil
}

func (s *produkService) GetDetailedPendingProduks(ctx context.Context, restokID string) (dto.PendingStok, error) {
	produk, err := s.produkRepo.GetDetailedPendingProduks(ctx, nil, restokID)
	if err != nil {
		return dto.PendingStok{}, err
	}

	return produk, nil
}

func (s *produkService) InsertProduk(ctx context.Context, restokID string) (entity.Produk, error) {
	produk, err := s.produkRepo.InsertProduk(ctx, nil, restokID)
	if err != nil {
		return entity.Produk{}, err
	}

	return produk, nil
}

func (s *produkService) GetAllRestokWithPagination(ctx context.Context, req dto.RestokProdukPaginationRequest) ([]dto.RestokDTO, error) {
	allRestok, err := s.produkRepo.GetAllRestok(ctx, nil, req.StartDate, req.EndDate, req.Order)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch restok data: %w", err)
	}

	for i := range allRestok {
		tanggalRestok, err := time.Parse(time.RFC3339, allRestok[i].TanggalRestok)
		if err != nil {
			return nil, fmt.Errorf("failed to parse tanggal restok: %w", err)
		}
		allRestok[i].TanggalRestok = tanggalRestok.Format("2006-01-02") // Format as YYYY-MM-DD

		detailRestok, err := s.produkRepo.GetAllRestokDetails(ctx, nil, allRestok[i].ID)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch detail restok for restok ID %d: %w", allRestok[i].ID, err)
		}

		allRestok[i].DetailRestok = detailRestok
	}

	return allRestok, nil
}

func (s *produkService) GetIndexFinalStok(ctx context.Context) (dto.IndexFinalStok, error) {
	merks, err := s.merkRepo.GetAllMerk(ctx, nil)
	if err != nil {
		return dto.IndexFinalStok{}, err
	}

	jenis, err := s.jenisRepo.GetAllJenis(ctx, nil)
	if err != nil {
		return dto.IndexFinalStok{}, err
	}

	var merkNames []string
	for _, merk := range merks {
		merkNames = append(merkNames, merk.Nama)
	}

	var jenisNames []string
	for _, j := range jenis {
		jenisNames = append(jenisNames, j.NamaJenis)
	}

	return dto.IndexFinalStok{
		Merks: merkNames,
		Jenis: jenisNames,
	}, nil

}

func (s *produkService) FinalStokProduk(ctx context.Context, filter dto.FilterFinalStok) (any, error) {
	if filter.Filter == "produk" {
		return s.produkRepo.GetFinalStokProduk(ctx)
	} else if filter.Filter == "jenis" {
		return s.produkRepo.GetFinalStokJenis(ctx)
	} else if filter.Filter == "merk" {
		return s.produkRepo.GetFinalStokMerk(ctx)
	} else {
		return s.produkRepo.GetFinalStok(ctx, filter)
	}
}
