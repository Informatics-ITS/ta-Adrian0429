package service

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"bumisubur-be/repository"
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/xuri/excelize/v2"
)

type (
	TransaksiService interface {
		Index(ctx context.Context) ([]dto.IndexTransaksi, error)
		CreateTransaksi(ctx context.Context, createTransaksi dto.CreateTransaksi, userID string) (dto.TransaksiResponse, error)
		GetHistoryTransaksi(ctx context.Context, req dto.TransactionPaginationRequest) (any, error)
		DownloadByNota(ctx context.Context, req dto.TransactionPaginationRequest) ([]byte, error)
		DownloadByProduk(ctx context.Context, req dto.TransactionPaginationRequest) ([]byte, error)

		GetNotaData(ctx context.Context, notaID string) (dto.ReturnUser, error)
	}

	transaksiService struct {
		transaksiRepo repository.TransaksiRepository
		jwtService    JWTService
	}
)

func NewTransaksiService(transaksiRepo repository.TransaksiRepository, jwtService JWTService) TransaksiService {
	return &transaksiService{
		transaksiRepo: transaksiRepo,
		jwtService:    jwtService,
	}
}

func (t *transaksiService) Index(ctx context.Context) ([]dto.IndexTransaksi, error) {
	Index, err := t.transaksiRepo.GetIndexTransaksi(ctx, nil)
	if err != nil {
		return nil, err
	}

	return Index, nil
}

func (t *transaksiService) CreateTransaksi(ctx context.Context, createTransaksi dto.CreateTransaksi, userID string) (dto.TransaksiResponse, error) {
	CountHargaBe := 0.0
	for _, produk := range createTransaksi.Produks {
		produkDetail, err := t.transaksiRepo.GetProdukByDetailID(ctx, nil, produk.DetailProdukID)
		if err != nil {
			return dto.TransaksiResponse{}, err
		}
		CountHargaBe += produkDetail.HargaJual * float64(produk.JumlahProduk)
	}

	if createTransaksi.Diskon > 0 && createTransaksi.Diskon <= 100 {
		CountHargaBe = CountHargaBe * ((100 - createTransaksi.Diskon) / 100)
	}

	if CountHargaBe != createTransaksi.TotalHarga {
		return dto.TransaksiResponse{}, fmt.Errorf("total price mismatch: calculated total is %.2f, but provided total is %.2f", CountHargaBe, createTransaksi.TotalHarga)
	}

	for _, produk := range createTransaksi.Produks {
		produkDetail, err := t.transaksiRepo.GetDetailProdukStok(ctx, nil, produk.DetailProdukID)
		if err != nil {
			return dto.TransaksiResponse{}, err
		}

		if produkDetail.Stok < produk.JumlahProduk {
			return dto.TransaksiResponse{}, fmt.Errorf("stock is not enough for product %d", produk.DetailProdukID)
		}
	}

	// Generate transaction ID as int64
	today := time.Now().Format("20060102") // Format as YYYYMMDD
	latestID, err := t.transaksiRepo.GetLatestTransaksiID(ctx, today)
	if err != nil {
		return dto.TransaksiResponse{}, err
	}

	// Determine the sequence number
	sequence := 1
	if latestID != 0 {
		// Extract the sequence part and increment it
		sequence = int(latestID%10000) + 1
	}

	// Create the transaction ID as int64
	datePrefix, _ := strconv.ParseInt(today, 10, 64)
	transactionID := datePrefix*10000 + int64(sequence)

	transaksi := entity.Transaksi{
		ID:               transactionID, // Assign the generated ID
		TanggalTransaksi: time.Now(),
		TotalHarga:       createTransaksi.TotalHarga,
		MetodeBayar:      createTransaksi.MetodeBayar,
		CreatedBy:        userID,
		Diskon:           createTransaksi.Diskon,
	}

	Transaksi, err := t.transaksiRepo.CreateTransaksi(ctx, nil, transaksi)
	if err != nil {
		return dto.TransaksiResponse{}, err
	}

	for _, produk := range createTransaksi.Produks {
		detailTransaksi := entity.DetailTransaksi{
			JumlahProduk:   produk.JumlahProduk,
			TransaksiID:    Transaksi.ID,
			DetailProdukID: produk.DetailProdukID,
		}

		_, err := t.transaksiRepo.CreateDetailTransaksi(ctx, nil, detailTransaksi)
		if err != nil {
			return dto.TransaksiResponse{}, err
		}
	}

	return dto.TransaksiResponse{
		ID:               Transaksi.ID,
		TanggalTransaksi: Transaksi.CreatedAt,
		TotalHarga:       Transaksi.TotalHarga,
		MetodeBayar:      Transaksi.MetodeBayar,
		Diskon:           Transaksi.Diskon,
	}, nil
}

func (t *transaksiService) GetHistoryTransaksi(ctx context.Context, req dto.TransactionPaginationRequest) (any, error) {

	if req.Filter == "" || req.Filter == "produk" {
		History, err := t.transaksiRepo.GetTransaksiByProduk(ctx, nil, req)
		if err != nil {
			return nil, err
		}

		return History, nil

	} else if req.Filter == "nota" {

		transaksiData, err := t.transaksiRepo.GetTransaksiByNota(ctx, nil, req)
		if err != nil {
			return dto.GetTransaksiNotaResponse{}, err
		}

		var SumTotalProfit float64
		var detailedTransaksiList []dto.GetTransaksiNota

		for i := range transaksiData.Data {
			items := transaksiData.Data[i]
			details, err := t.transaksiRepo.GetTransaksiNotaDetail(ctx, nil, items.IDTransaksi)
			if err != nil {
				return dto.GetTransaksiNotaResponse{}, err
			}

			// Calculate total profit for this transaction
			var totalProfit float64
			for _, detail := range details {
				totalProfit += detail.TotalProfit // Summing up profit from each detail item
			}

			// Construct detailed transaction
			detailedTransaksi := dto.GetTransaksiNota{
				IDTransaksi:      items.IDTransaksi,
				TotalProduk:      items.TotalProduk,
				TotalPendapatan:  items.TotalPendapatan,
				TanggalTransaksi: items.TanggalTransaksi,
				DiskonTransaksi:  items.DiskonTransaksi,
				TotalProfit:      totalProfit, // Assign the calculated total profit
				DetailTransaksi:  details,
			}

			// Sum up total profit
			SumTotalProfit += totalProfit
			detailedTransaksiList = append(detailedTransaksiList, detailedTransaksi)
		}

		response := dto.GetTransaksiNotaResponse{
			Data:           detailedTransaksiList,
			SumTotalProfit: SumTotalProfit,
			PaginationResponse: dto.PaginationResponse{
				PerPage: req.PerPage,
				Page:    req.Page,
				MaxPage: transaksiData.PaginationResponse.MaxPage,
				Count:   transaksiData.PaginationResponse.Count,
			},
		}

		return response, nil
	}

	return nil, nil
}

func (s *transaksiService) DownloadByNota(ctx context.Context, req dto.TransactionPaginationRequest) ([]byte, error) {
	transaksiData, err := s.transaksiRepo.GetTransaksiByNota(ctx, nil, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions by nota: %w", err)
	}

	// Prepare detailed data with transaction details
	var detailedTransaksiList []dto.GetTransaksiNota
	for _, transaksi := range transaksiData.Data {
		details, err := s.transaksiRepo.GetTransaksiNotaDetail(ctx, nil, transaksi.IDTransaksi)
		if err != nil {
			return nil, fmt.Errorf("failed to get transaction details: %w", err)
		}
		detailedTransaksiList = append(detailedTransaksiList, dto.GetTransaksiNota{
			IDTransaksi:      transaksi.IDTransaksi,
			TotalProduk:      transaksi.TotalProduk,
			TotalPendapatan:  transaksi.TotalPendapatan,
			DiskonTransaksi:  transaksi.DiskonTransaksi,
			TanggalTransaksi: transaksi.TanggalTransaksi,
			DetailTransaksi:  details,
		})
	}

	// Create Excel file
	file := excelize.NewFile()

	// Create and activate the sheet
	sheet := "Transaksi Nota"
	file.NewSheet(sheet)
	file.SetActiveSheet(1)

	// Set headers
	headers := []string{"Kode Nota", "Merk", "Nama", "Kategori Barang", "Ukuran", "Jumlah Item", "Harga per Item", "Total Item", "Total Pendapatan", "Tanggal"}
	for colIndex, header := range headers {
		col := string(rune('A' + colIndex))
		file.SetCellValue(sheet, col+"1", header)
	}

	// Add rows and merge cells
	row := 2
	for _, transaksi := range detailedTransaksiList {
		fmt.Println(transaksi)
		startRow := row
		for _, detail := range transaksi.DetailTransaksi {
			file.SetCellValue(sheet, fmt.Sprintf("A%d", row), transaksi.IDTransaksi)
			file.SetCellValue(sheet, fmt.Sprintf("B%d", row), detail.Merk)
			file.SetCellValue(sheet, fmt.Sprintf("C%d", row), detail.NamaProduk)
			file.SetCellValue(sheet, fmt.Sprintf("D%d", row), detail.Jenis)
			file.SetCellValue(sheet, fmt.Sprintf("E%d", row), detail.Ukuran)
			file.SetCellValue(sheet, fmt.Sprintf("F%d", row), detail.JumlahItem)
			file.SetCellValue(sheet, fmt.Sprintf("G%d", row), detail.HargaProduk)
			file.SetCellValue(sheet, fmt.Sprintf("H%d", row), transaksi.TotalProduk)
			file.SetCellValue(sheet, fmt.Sprintf("I%d", row), transaksi.TotalPendapatan)
			file.SetCellValue(sheet, fmt.Sprintf("J%d", row), transaksi.TanggalTransaksi)

			row++
		}
		endRow := row - 1

		// Merge cells for "Kode Nota" column if there are multiple rows for the same transaction
		if endRow > startRow {
			if err := file.MergeCell(sheet, fmt.Sprintf("A%d", startRow), fmt.Sprintf("A%d", endRow)); err != nil {
				return nil, fmt.Errorf("failed to merge cells: %w", err)
			}
			if err := file.MergeCell(sheet, fmt.Sprintf("I%d", startRow), fmt.Sprintf("I%d", endRow)); err != nil {
				return nil, fmt.Errorf("failed to merge cells: %w", err)
			}
			if err := file.MergeCell(sheet, fmt.Sprintf("J%d", startRow), fmt.Sprintf("J%d", endRow)); err != nil {
				return nil, fmt.Errorf("failed to merge cells: %w", err)
			}
		}
	}

	// Write file to memory
	buf, err := file.WriteToBuffer()
	if err != nil {
		return nil, fmt.Errorf("failed to write Excel file: %w", err)
	}
	return buf.Bytes(), nil
}

func (s *transaksiService) DownloadByProduk(ctx context.Context, req dto.TransactionPaginationRequest) ([]byte, error) {
	// Fetch main transaction data
	History, err := s.transaksiRepo.GetTransaksiByProduk(ctx, nil, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions by product: %w", err)
	}

	// Create Excel file
	file := excelize.NewFile()

	// Create and activate the sheet
	sheet := "Transaksi Produk"
	file.NewSheet(sheet)
	file.SetActiveSheet(1)

	// Set headers
	headers := []string{"Barcode ID", "Produk", "Merk", "Jenis", "Ukuran", "Warna", "Jumlah Produk", "Total Pendapatan", "Tanggal"}
	for colIndex, header := range headers {
		col := string(rune('A' + colIndex))
		file.SetCellValue(sheet, col+"1", header)
	}

	// Add rows
	row := 2
	for _, transaksi := range History.Data {
		fmt.Println(transaksi)
		file.SetCellValue(sheet, fmt.Sprintf("A%d", row), transaksi.BarcodeID)
		file.SetCellValue(sheet, fmt.Sprintf("B%d", row), transaksi.NamaProduk)
		file.SetCellValue(sheet, fmt.Sprintf("C%d", row), transaksi.Merk)
		file.SetCellValue(sheet, fmt.Sprintf("D%d", row), transaksi.Jenis)
		file.SetCellValue(sheet, fmt.Sprintf("E%d", row), transaksi.Ukuran)
		file.SetCellValue(sheet, fmt.Sprintf("F%d", row), transaksi.Warna)
		file.SetCellValue(sheet, fmt.Sprintf("G%d", row), transaksi.TotalBarang)
		file.SetCellValue(sheet, fmt.Sprintf("H%d", row), transaksi.TotalPendapatan)
		file.SetCellValue(sheet, fmt.Sprintf("I%d", row), transaksi.TanggalTransaksi)
		row++
	}

	// Write file to memory
	buf, err := file.WriteToBuffer()
	if err != nil {
		return nil, fmt.Errorf("failed to write Excel file: %w", err)
	}

	return buf.Bytes(), nil
}

func (s *transaksiService) GetNotaData(ctx context.Context, notaID string) (dto.ReturnUser, error) {

	transaksi, err := s.transaksiRepo.GetNotaData(ctx, nil, notaID)
	if err != nil {
		return dto.ReturnUser{}, err
	}

	details, err := s.transaksiRepo.GetNotaDataDetail(ctx, nil, strconv.FormatInt(transaksi.ID, 10))
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
