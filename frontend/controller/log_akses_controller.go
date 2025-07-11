package controller

import (
	"bumisubur-be/dto"
	"bumisubur-be/service"
	"bumisubur-be/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type (
	LogAksesController interface {
		GetAll(ctx *gin.Context)
		Download(ctx *gin.Context)
	}

	logAksesController struct {
		logAksesService service.LogAksesService
	}
)

func NewLogAksesController(la service.LogAksesService) LogAksesController {
	return &logAksesController{
		logAksesService: la,
	}
}

func (c *logAksesController) GetAll(ctx *gin.Context) {
	var filter dto.LogAksesPaginationRequest
	if err := ctx.ShouldBind(&filter); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.logAksesService.GetAllLogAkses(ctx.Request.Context(), filter)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_LOG, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_LOG, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *logAksesController) Download(ctx *gin.Context) {
	var filter dto.LogAksesPaginationRequest
	if err := ctx.ShouldBind(&filter); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.logAksesService.Download(ctx.Request.Context(), filter)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_LOG, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Disposition", "attachment; filename=data_cabang.xlsx")
	ctx.Data(http.StatusOK, "application/octet-stream", result)
}
