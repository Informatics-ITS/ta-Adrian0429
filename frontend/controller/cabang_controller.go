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
	CabangController interface {
		CreateCabang(ctx *gin.Context)
		GetAllCabang(ctx *gin.Context)
		GetCabangByID(ctx *gin.Context)
		UpdateCabang(ctx *gin.Context)
		DeleteCabang(ctx *gin.Context)

		DownloadDataCabang(ctx *gin.Context)
	}

	cabangController struct {
		cabangService service.CabangService
	}
)

func NewCabangController(cs service.CabangService) CabangController {
	return &cabangController{
		cabangService: cs,
	}
}

func (c *cabangController) CreateCabang(ctx *gin.Context) {
	var cabang dto.CabangRequest
	if err := ctx.ShouldBind(&cabang); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.cabangService.CreateCabang(ctx.Request.Context(), cabang)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_CABANG, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_CABANG, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *cabangController) GetAllCabang(ctx *gin.Context) {
	var req dto.PaginationRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.cabangService.GetAllCabangWithPagination(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_CABANG, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_CABANG, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *cabangController) GetCabangByID(ctx *gin.Context) {
	cabangID := ctx.Param("cabang_id")

	id, err := strconv.Atoi(cabangID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.cabangService.GetCabangByID(ctx.Request.Context(), id)

	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_CABANG_BY_ID, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *cabangController) UpdateCabang(ctx *gin.Context) {
	var cabang dto.CabangRequest
	if err := ctx.ShouldBind(&cabang); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	cabangID := ctx.Param("cabang_id")
	id, err := strconv.Atoi(cabangID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.cabangService.UpdateCabang(ctx.Request.Context(), cabang, id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_CABANG, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_CABANG, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *cabangController) DeleteCabang(ctx *gin.Context) {
	cabangID := ctx.Param("cabang_id")
	id, err := strconv.Atoi(cabangID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	err = c.cabangService.DeleteCabang(ctx.Request.Context(), id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DELETE_CABANG, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_DELETE_CABANG+" "+cabangID, nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *cabangController) DownloadDataCabang(ctx *gin.Context) {
	result, err := c.cabangService.DownloadDataCabang(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed("Failed to download data cabang", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Disposition", "attachment; filename=data_cabang.xlsx")
	ctx.Data(http.StatusOK, "application/octet-stream", result)
}
