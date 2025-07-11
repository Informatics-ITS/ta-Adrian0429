package controller

import (
	"bumisubur-be/dto"
	"bumisubur-be/service"
	"bumisubur-be/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type (
	PengeluaranController interface {
		CreatePengeluaran(ctx *gin.Context)
		GetAllPengeluaran(ctx *gin.Context)
		GetPengeluaranByID(ctx *gin.Context)
		UpdatePengeluaran(ctx *gin.Context)
		DeletePengeluaran(ctx *gin.Context)
		DownloadDataPengeluaran(ctx *gin.Context)
	}

	pengeluaranController struct {
		pengeluaranService service.PengeluaranService
	}
)

func NewPengeluaranController(la service.PengeluaranService) PengeluaranController {
	return &pengeluaranController{
		pengeluaranService: la,
	}
}

func (c *pengeluaranController) CreatePengeluaran(ctx *gin.Context) {
	var pengeluaran dto.PengeluaranRequest
	if err := ctx.ShouldBind(&pengeluaran); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.pengeluaranService.CreatePengeluaran(ctx.Request.Context(), pengeluaran)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_PENGELUARAN, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_PENGELUARAN, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *pengeluaranController) GetAllPengeluaran(ctx *gin.Context) {
	filter := ctx.Query("filter")
	start_date := ctx.Query("start_date")
	end_date := ctx.Query("end_date")
	var req dto.PaginationRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	var result interface{}
	var err error

	result, err = c.pengeluaranService.GetAllPengeluaran(ctx.Request.Context(), req, filter, start_date, end_date)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_PENGELUARAN, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_PENGELUARAN, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *pengeluaranController) GetPengeluaranByID(ctx *gin.Context) {
	pengeluaranID := ctx.Param("pengeluaran_id")
	id, err := strconv.Atoi(pengeluaranID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_PENGELUARAN_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.pengeluaranService.GetPengeluaranByID(ctx.Request.Context(), id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_PENGELUARAN_BY_ID, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_PENGELUARAN_BY_ID, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *pengeluaranController) UpdatePengeluaran(ctx *gin.Context) {
	var pengeluaran dto.PengeluaranRequest
	if err := ctx.ShouldBind(&pengeluaran); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	pengeluaranID := ctx.Param("pengeluaran_id")
	id, err := strconv.Atoi(pengeluaranID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_PENGELUARAN_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	result, err := c.pengeluaranService.UpdatePengeluaran(ctx.Request.Context(), pengeluaran, id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_PENGELUARAN, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_PENGELUARAN, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *pengeluaranController) DeletePengeluaran(ctx *gin.Context) {
	pengeluaranID := ctx.Param("pengeluaran_id")
	id, err := strconv.Atoi(pengeluaranID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_PENGELUARAN_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	err = c.pengeluaranService.DeletePengeluaran(ctx.Request.Context(), id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DELETE_PENGELUARAN, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_DELETE_PENGELUARAN, nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *pengeluaranController) DownloadDataPengeluaran(ctx *gin.Context) {
	filter := ctx.Query("filter")
	start_date := ctx.Query("start_date")
	end_date := ctx.Query("end_date")
	result, err := c.pengeluaranService.DownloadDataPengeluaran(ctx.Request.Context(), filter, start_date, end_date)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to download data pengeluaran", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Disposition", "attachment; filename=data_pengeluaran.xlsx")
	ctx.Data(http.StatusOK, "application/octet-stream", result)
}
