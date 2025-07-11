package controller

import (
	"bumisubur-be/dto"
	"bumisubur-be/service"
	"bumisubur-be/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type (
	ReturnController interface {
		GetReturnUser(ctx *gin.Context)
		GetReturnSupplier(ctx *gin.Context)

		GetHistoryRestokUser(ctx *gin.Context)
		GetHistoryRestokSupplier(ctx *gin.Context)

		CreateReturnUser(ctx *gin.Context)
		CreateReturnSupplier(ctx *gin.Context)
	}

	returnController struct {
		returnService service.ReturnService
	}
)

func NewReturnController(rs service.ReturnService) ReturnController {
	return &returnController{
		returnService: rs,
	}
}

func (rc *returnController) GetReturnSupplier(ctx *gin.Context) {
	restokID := ctx.Param("restok_id")

	result, err := rc.returnService.GetReturnSupplier(ctx.Request.Context(), restokID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_PRODUK, result)
	ctx.JSON(http.StatusOK, res)
}

func (rc *returnController) GetReturnUser(ctx *gin.Context) {
	notaID := ctx.Param("nota_id")
	result, err := rc.returnService.GetReturnUser(ctx, notaID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_TRANSAKSI_BY_NOTA_ID, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_TRANSAKSI_BY_NOTA_ID, result)
	ctx.JSON(http.StatusOK, res)
}

func (rc *returnController) CreateReturnUser(ctx *gin.Context) {
	var returnData dto.CreateReturnUser
	if err := ctx.ShouldBind(&returnData); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := rc.returnService.CreateReturnUser(ctx.Request.Context(), returnData)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_RETURN, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_SUPPLIER, result)
	ctx.JSON(http.StatusOK, res)

}

func (rc *returnController) CreateReturnSupplier(ctx *gin.Context) {
	var returnData dto.CreateReturnSupplier
	if err := ctx.ShouldBind(&returnData); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := rc.returnService.CreateReturnSupplier(ctx.Request.Context(), returnData)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_RETURN, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_RETURN, result)
	ctx.JSON(http.StatusOK, res)

}

func (rc *returnController) GetHistoryRestokUser(ctx *gin.Context) {
	var req dto.GetHistoryReturnFilter
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := rc.returnService.GetHistoryReturnUser(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_RETURN_HISTORY_USER, result)
	ctx.JSON(http.StatusOK, res)
}

func (rc *returnController) GetHistoryRestokSupplier(ctx *gin.Context) {
	var req dto.GetHistoryReturnFilter
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := rc.returnService.GetHistoryReturnSupplier(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_RETURN_HISTORY_SUPPLIER, result)
	ctx.JSON(http.StatusOK, res)
}
