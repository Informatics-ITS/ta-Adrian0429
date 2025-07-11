package controller

import (
	"bumisubur-be/dto"
	"bumisubur-be/service"
	"bumisubur-be/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type (
	ProdukController interface {
		IndexRestokProduk(ctx *gin.Context)
		CreateProduk(ctx *gin.Context)

		IndexOldProduk(ctx *gin.Context)
		CreateOldProduk(ctx *gin.Context)

		GetAllStokProduk(ctx *gin.Context)
		GetProdukDetails(ctx *gin.Context)

		GetPendingProduks(ctx *gin.Context)
		GetDetailedPendingProduks(ctx *gin.Context)
		UpdateDetailedPendingProduks(ctx *gin.Context)

		DeleteDetailedPendingProduks(ctx *gin.Context)

		GetAllRestok(ctx *gin.Context)

		GetIndexFinalStok(ctx *gin.Context)
		FinalStokProduk(ctx *gin.Context)

		InsertProduk(ctx *gin.Context)

	}

	produkController struct {
		produkService service.ProdukService
	}
)

func NewProdukController(la service.ProdukService) ProdukController {
	return &produkController{
		produkService: la,
	}
}

func (pc *produkController) IndexRestokProduk(ctx *gin.Context) {
	result, err := pc.produkService.IndexRestokProduk(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_INDEX_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("Sukses get index produk", result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) CreateProduk(ctx *gin.Context) {
	var produk dto.ProdukRequest
	if err := ctx.ShouldBind(&produk); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := pc.produkService.CreateProduk(ctx.Request.Context(), produk)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_PRODUK, result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) CreateOldProduk(ctx *gin.Context) {
	var produk dto.OldProdukRequest
	if err := ctx.ShouldBind(&produk); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := pc.produkService.CreateOldProduk(ctx.Request.Context(), produk)
	if err != nil {
		res := utils.BuildResponseFailed("gagal menambah stok produk", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("sukses menambah stok produk", result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) GetAllRestok(ctx *gin.Context) {
	var req dto.RestokProdukPaginationRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := pc.produkService.GetAllRestokWithPagination(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_RESTOK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_RESTOK, result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) GetAllStokProduk(ctx *gin.Context) {
	var req dto.ProdukPaginationRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := pc.produkService.GetAllProdukWithPagination(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_PRODUK, result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) IndexOldProduk(ctx *gin.Context) {
	result, err := pc.produkService.IndexRestokOldProduk(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_INDEX_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("Sukses get index produk", result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) UpdateDetailedPendingProduks(ctx *gin.Context) {
	var req dto.EditPendingRestok
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	_, err := pc.produkService.UpdateDetailedPendingProduks(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_DETAILED_PRODUK_BY_ID, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_DETAILED_PRODUK_BY_ID, nil)
	ctx.JSON(http.StatusOK, res)

}

func (pc *produkController) DeleteDetailedPendingProduks(ctx *gin.Context) {
	produkID := ctx.Param("id")

	err := pc.produkService.DeleteDetailedPendingProduks(ctx.Request.Context(), produkID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DELETE_DETAILED_PRODUK_BY_ID, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_DELETE_PENDING_PRODUK_BY_ID, nil)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) GetProdukDetails(ctx *gin.Context) {
	produkID := ctx.Param("id")

	result, err := pc.produkService.GetProdukDetails(ctx.Request.Context(), produkID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_PRODUK_BY_ID, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_PRODUK_BY_ID, result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) GetPendingProduks(ctx *gin.Context) {
	result, err := pc.produkService.GetPendingProduks(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_PRODUK, result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) GetDetailedPendingProduks(ctx *gin.Context) {
	restokID := ctx.Param("id")

	result, err := pc.produkService.GetDetailedPendingProduks(ctx.Request.Context(), restokID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_PRODUK, result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) InsertProduk(ctx *gin.Context) {
	produkID := ctx.Param("id")

	result, err := pc.produkService.InsertProduk(ctx.Request.Context(), produkID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_PRODUK, result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) GetIndexFinalStok(ctx *gin.Context) {
	result, err := pc.produkService.GetIndexFinalStok(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_INDEX_PRODUK, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("Sukses get index produk", result)
	ctx.JSON(http.StatusOK, res)
}

func (pc *produkController) FinalStokProduk(ctx *gin.Context) {
	var filter dto.FilterFinalStok
	if err := ctx.ShouldBind(&filter); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := pc.produkService.FinalStokProduk(ctx.Request.Context(), filter)
	if err != nil {
		res := utils.BuildResponseFailed("Gagal mendapatkan stok produk final", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("Sukses mendapatkan stok produk final", result)
	ctx.JSON(http.StatusOK, res)
}
