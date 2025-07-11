package service

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"bumisubur-be/repository"
	"context"
	"fmt"
	"strconv"
)

type ReturnService interface {
	GetReturnSupplier(ctx context.Context, restokID string) (dto.GetReturnSupplier, error)
	GetReturnUser(ctx context.Context, notaID string) (dto.ReturnUser, error)

	GetHistoryReturnUser(ctx context.Context, req dto.GetHistoryReturnFilter) ([]dto.HistoryReturnUser, error)
	GetHistoryReturnSupplier(ctx context.Context, req dto.GetHistoryReturnFilter) ([]dto.HistoryReturnSupplier, error)

	CreateReturnUser(ctx context.Context, returnData dto.CreateReturnUser) ([]dto.CreateReturnUserResponse, error)
	CreateReturnSupplier(ctx context.Context, returnData dto.CreateReturnSupplier) (any, error)
}

type restokService struct {
	returnRepo   repository.ReturnRepository
	jenisRepo    repository.JenisRepository
	merkRepo     repository.MerkRepository
	supplierRepo repository.SupplierRepository
}

func NewReturnService(returnRepo repository.ReturnRepository, jenisRepo repository.JenisRepository, merkRepo repository.MerkRepository, supplierRepo repository.SupplierRepository) ReturnService {
	return &restokService{
		returnRepo:   returnRepo,
		jenisRepo:    jenisRepo,
		merkRepo:     merkRepo,
		supplierRepo: supplierRepo,
	}
}

func (rs *restokService) GetReturnSupplier(ctx context.Context, restokID string) (dto.GetReturnSupplier, error) {
	restok, err := rs.returnRepo.GetReturnSupplier(ctx, nil, restokID)
	if err != nil {
		return dto.GetReturnSupplier{}, err
	}

	return restok, nil
}

func (rs *restokService) GetReturnUser(ctx context.Context, notaID string) (dto.ReturnUser, error) {
	transaksi, err := rs.returnRepo.GetReturnUser(ctx, nil, notaID)
	if err != nil {
		return dto.ReturnUser{}, err
	}

	details, err := rs.returnRepo.GetReturnUserDetail(ctx, nil, strconv.FormatInt(transaksi.ID, 10))
	if err != nil {
		return dto.ReturnUser{}, err
	}

	return dto.ReturnUser{
		TransaksiID:      transaksi.ID,
		TanggalTransaksi: transaksi.TanggalTransaksi,
		TotalHarga:       transaksi.TotalHarga,
		MetodeBayar:      transaksi.MetodeBayar,
		Diskon:           transaksi.Diskon,
		DetailTransaksi:  details,
	}, nil
}

func (rs *restokService) CreateReturnUser(ctx context.Context, returnData dto.CreateReturnUser) ([]dto.CreateReturnUserResponse, error) {
	// Fetch old transaction data
	oldData, err := rs.GetReturnUser(ctx, strconv.FormatInt(returnData.TransaksiID, 10))
	if err != nil {
		return nil, err
	}

	// Map old transaction details for quick lookup
	oldDetailMap := make(map[int]dto.DetailReturnUser) // key: DetailTransaksiID, value: DetailReturnUser
	for _, oldItem := range oldData.DetailTransaksi {
		oldDetailMap[oldItem.DetailTransaksiID] = oldItem
	}

	// Prepare return summary list
	var returnSummaries []dto.ReturnSummary
	for _, newItem := range returnData.DetailTransaksi {
		oldItem, exists := oldDetailMap[newItem.DetailTransaksiID]
		if !exists {
			return nil, fmt.Errorf("invalid detail_transaksi_id: %d", newItem.DetailTransaksiID)
		}

		returnedQty := oldItem.JumlahItem - newItem.JumlahItem
		if returnedQty < 0 || returnedQty > oldItem.JumlahItem {
			return nil, fmt.Errorf("invalid return quantity for detail_transaksi_id: %d", newItem.DetailTransaksiID)
		}

		if returnedQty > 0 {
			// Store return details in struct
			returnSummaries = append(returnSummaries, dto.ReturnSummary{
				DetailProdukID:    newItem.DetailProdukID,
				DetailTransaksiID: newItem.DetailTransaksiID,
				JumlahReturn:      returnedQty,
			})
		}
	}

	// Process database updates
	if err := rs.processReturnsUser(ctx, returnSummaries, oldData.TransaksiID, oldData.Diskon); err != nil {
		return nil, err
	}

	// Now create the ReturnUser entity and DetailReturnUser records
	returnUser := entity.ReturnUser{
		TransaksiID: returnData.TransaksiID,
		Alasan:      returnData.Alasan,
	}

	returnRes, err := rs.returnRepo.CreateReturnUser(ctx, returnUser)
	if err != nil {
		return nil, fmt.Errorf("failed to create return record: %v", err)
	}

	// Create DetailReturnUser records
	for _, summary := range returnSummaries {
		detailReturnUser := entity.DetailReturnUser{
			JumlahProduk:      summary.JumlahReturn,
			DetailProdukID:    summary.DetailProdukID,
			DetailTransaksiID: summary.DetailTransaksiID,
			ReturnUserID:      returnRes.ID,
		}

		if _, err := rs.returnRepo.CreateDetailReturnUser(ctx, detailReturnUser); err != nil {
			return nil, fmt.Errorf("failed to create return detail record: %v", err)
		}

	}

	var returnResponses []dto.CreateReturnUserResponse
	for _, summary := range returnSummaries {
		oldItem, exists := oldDetailMap[summary.DetailTransaksiID]
		if !exists {
			continue
		}

		returnResponses = append(returnResponses, dto.CreateReturnUserResponse{
			Merk:        oldItem.Merk,
			NamaProduk:  oldItem.NamaProduk,
			Jenis:       oldItem.Jenis,
			Ukuran:      oldItem.Ukuran,
			JumlahRetur: summary.JumlahReturn,
			HargaProduk: oldItem.HargaProduk,
		})
	}

	return returnResponses, nil
}

func (rs *restokService) processReturnsUser(ctx context.Context, returnSummaries []dto.ReturnSummary, transaksiID int64, diskon float64) error {
	var totalReturnAmount float64

	// Loop through return summaries and process returns
	for _, item := range returnSummaries {
		// Get the product price for the returned item
		productPrice, err := rs.returnRepo.GetProductPrice(ctx, nil, item.DetailProdukID)
		if err != nil {
			return err
		}

		adjustedReturnAmount := float64(item.JumlahReturn) * productPrice

		adjustedReturnAmount -= adjustedReturnAmount * (diskon / 100)

		totalReturnAmount += adjustedReturnAmount

		if err := rs.returnRepo.IncreaseStock(ctx, item.DetailProdukID, item.JumlahReturn); err != nil {
			return err
		}

		if err := rs.returnRepo.ReduceTransactionItem(ctx, item.DetailTransaksiID, item.JumlahReturn); err != nil {
			return err
		}
	}

	if err := rs.returnRepo.UpdateTransactionTotal(ctx, transaksiID, totalReturnAmount); err != nil {
		return err
	}

	return nil
}

func (rs *restokService) CreateReturnSupplier(ctx context.Context, returnData dto.CreateReturnSupplier) (any, error) {
	// Fetch old transaction data
	oldData, err := rs.GetReturnSupplier(ctx, strconv.FormatInt(returnData.RestokID, 10))
	if err != nil {
		return nil, err
	}

	// Map old restock details for quick lookup
	oldDetailMap := make(map[int]dto.DetailReturnSupplier) // key: DetailRestokID
	for _, oldItem := range oldData.Stoks {
		oldDetailMap[oldItem.Detail_Restok_ID] = oldItem
	}

	var returnSummaries []dto.ReturnSummarySupplier
	var totalReturSum float64

	for _, newItem := range returnData.DetailTransaksi {
		oldItem, exists := oldDetailMap[newItem.Detail_Restok_ID]
		if !exists {
			return nil, fmt.Errorf("invalid detail_restok_id: %d", newItem.Detail_Restok_ID)
		}

		returnedQty := oldItem.JumlahStok - newItem.JumlahItem
		if returnedQty < 0 || returnedQty > oldItem.JumlahStok {
			return nil, fmt.Errorf("invalid return quantity for detail_restok_id: %d", newItem.Detail_Restok_ID)
		}

		if returnedQty > 0 {
			returnSummaries = append(returnSummaries, dto.ReturnSummarySupplier{
				DetailProdukID: newItem.Detail_Produk_ID,
				DetailRestokID: newItem.Detail_Restok_ID,
				JumlahReturn:   returnedQty,
			})

			totalReturSum += float64(returnedQty)
		}
	}

	if err := rs.processReturnsSupplier(ctx, returnSummaries); err != nil {
		return nil, err
	}

	// Create ReturnSupplier entity
	returnSupplier := entity.ReturnSupplier{
		RestokID: returnData.RestokID,
		Alasan:   returnData.Alasan,
	}

	returnRes, err := rs.returnRepo.CreateReturnSupplier(ctx, returnSupplier)
	if err != nil {
		return nil, fmt.Errorf("failed to create return supplier record: %v", err)
	}

	// Create DetailReturnSupplier records
	for _, summary := range returnSummaries {
		detailReturnSupplier := entity.DetailReturnSupplier{
			JumlahProduk:     summary.JumlahReturn,
			DetailProdukID:   summary.DetailProdukID,
			DetailRestokID:   summary.DetailRestokID,
			ReturnSupplierID: returnRes.ID,
		}

		if _, err := rs.returnRepo.CreateDetailReturnSupplier(ctx, detailReturnSupplier); err != nil {
			return nil, fmt.Errorf("failed to create return supplier detail record: %v", err)
		}
	}

	returnResponse := dto.CreateReturnSupplierResponse{
		NamaProduk: oldData.NamaProduk,
		Merk:       oldData.Merk,
		Jenis:      oldData.Jenis,
		TotalRetur: totalReturSum,
	}

	return returnResponse, nil
}

func (rs *restokService) processReturnsSupplier(ctx context.Context, returnSummaries []dto.ReturnSummarySupplier) error {
	for _, item := range returnSummaries {

		if err := rs.returnRepo.DecreaseStock(ctx, item.DetailProdukID, item.JumlahReturn); err != nil {
			return err
		}

		if err := rs.returnRepo.ReduceRestokItem(ctx, item.DetailRestokID, item.JumlahReturn); err != nil {
			return err
		}
	}

	return nil
}

func (rs *restokService) GetHistoryReturnUser(ctx context.Context, req dto.GetHistoryReturnFilter) ([]dto.HistoryReturnUser, error) {
	return rs.returnRepo.GetReturnUserHistoryWithDetails(ctx, req.StartDate, req.EndDate)
}

func (rs *restokService) GetHistoryReturnSupplier(ctx context.Context, req dto.GetHistoryReturnFilter) ([]dto.HistoryReturnSupplier, error) {
	return rs.returnRepo.GetReturnSupplierHistoryWithDetails(ctx, req.StartDate, req.EndDate)
}
