package controller

import (
	"bumisubur-be/dto"
	"bumisubur-be/service"
	"bumisubur-be/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type (
	TransaksiController interface {
		Index(ctx *gin.Context)
		CreateTransaksi(ctx *gin.Context)
		GetHistoryTransaksi(ctx *gin.Context)
		PrintMobile(ctx *gin.Context)
		DownloadData(ctx *gin.Context)
	}

	transaksiController struct {
		transaksiService service.TransaksiService
	}
)

func NewTransaksiController(cs service.TransaksiService) TransaksiController {
	return &transaksiController{
		transaksiService: cs,
	}
}

func (c *transaksiController) Index(ctx *gin.Context) {
	result, err := c.transaksiService.Index(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_INDEX_TRANSAKSI, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("Sukses get index transaksi", result)
	ctx.JSON(http.StatusOK, res)
}

func (c *transaksiController) CreateTransaksi(ctx *gin.Context) {
	var createTransaksi dto.CreateTransaksi
	if err := ctx.ShouldBind(&createTransaksi); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	userIDStr := ctx.MustGet("user_id").(string)

	result, err := c.transaksiService.CreateTransaksi(ctx, createTransaksi, userIDStr)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_TRANSAKSI, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_TRANSAKSI, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *transaksiController) GetHistoryTransaksi(ctx *gin.Context) {
	var req dto.TransactionPaginationRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.transaksiService.GetHistoryTransaksi(ctx, req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_HISTORY_TRANSAKSI, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_HISTORY_TRANSAKSI, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *transaksiController) DownloadData(ctx *gin.Context) {
	var req dto.TransactionPaginationRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}
	var err error
	var file []byte

	if req.Filter == "nota" {
		fmt.Println("downloading nota")
		file, err = c.transaksiService.DownloadByNota(ctx, req)
	} else if req.Filter == "produk" {
		fmt.Println("downloading produk")
		file, err = c.transaksiService.DownloadByProduk(ctx, req)
	} else {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid format"})
		return
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	ctx.Header("Content-Disposition", "attachment; filename=transaksi.xlsx")
	ctx.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", file)
}

func (c *transaksiController) PrintMobile(ctx *gin.Context) {
	notaId := ctx.Param("id")

	// Get data from database
	result, err := c.transaksiService.GetNotaData(ctx, notaId)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_TRANSAKSI_BY_NOTA_ID, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_HISTORY_TRANSAKSI, result)
	ctx.JSON(http.StatusOK, res)
}
