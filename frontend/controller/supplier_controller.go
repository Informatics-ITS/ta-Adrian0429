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
	SupplierController interface {
		Index(ctx *gin.Context)
		CreateSupplier(ctx *gin.Context)
		GetAllSupplier(ctx *gin.Context)
		GetSupplierByID(ctx *gin.Context)
		UpdateSupplier(ctx *gin.Context)
		UpdateSupplierSupply(ctx *gin.Context)
		DeleteSupplier(ctx *gin.Context)

		CreateJenis(ctx *gin.Context)
		DeleteJenis(ctx *gin.Context)
		GetAllJenis(ctx *gin.Context)
		DownloadDataSupplier(ctx *gin.Context)
	}

	supplierController struct {
		supplierService service.SupplierService
	}
)

func NewSupplierController(cs service.SupplierService) SupplierController {
	return &supplierController{
		supplierService: cs,
	}
}

func (c *supplierController) CreateSupplier(ctx *gin.Context) {
	var supplier dto.SupplierRequest
	if err := ctx.ShouldBind(&supplier); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.supplierService.CreateSupplier(ctx.Request.Context(), supplier)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_CREATE_SUPPLIER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_CREATE_SUPPLIER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) GetAllSupplier(ctx *gin.Context) {
	var req dto.PaginationRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.supplierService.GetAllSupplier(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_ALL_SUPPLIER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_ALL_SUPPLIER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) Index(ctx *gin.Context) {
	result, err := c.supplierService.Index(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_INDEX_SUPPLIER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_INDEX_SUPPLIER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) GetSupplierByID(ctx *gin.Context) {
	supplierID := ctx.Param("supplier_id")
	id, err := strconv.Atoi(supplierID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_SUPPLIER_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.supplierService.GetSupplierByID(ctx.Request.Context(), id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_SUPPLIER_BY_ID, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_SUPPLIER_BY_ID, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) UpdateSupplier(ctx *gin.Context) {
	var supplier dto.SupplierRequest
	if err := ctx.ShouldBind(&supplier); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	supplierID := ctx.Param("supplier_id")
	id, err := strconv.Atoi(supplierID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.supplierService.UpdateSupplier(ctx.Request.Context(), supplier, id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_SUPPLIER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_SUPPLIER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) UpdateSupplierSupply(ctx *gin.Context) {
	var supplier dto.UpdateSupplyRequest
	if err := ctx.ShouldBind(&supplier); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	supplierID := ctx.Param("supplier_id")
	id, err := strconv.Atoi(supplierID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.supplierService.UpdateSupplierSupply(ctx.Request.Context(), supplier, id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_SUPPLIER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_SUPPLIER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) DeleteSupplier(ctx *gin.Context) {
	supplierID := ctx.Param("supplier_id")
	id, err := strconv.Atoi(supplierID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	err = c.supplierService.DeleteSupplier(ctx.Request.Context(), id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DELETE_SUPPLIER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_DELETE_SUPPLIER, nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) CreateJenis(ctx *gin.Context) {
	var jenis dto.JenisRequest
	if err := ctx.ShouldBind(&jenis); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.supplierService.CreateJenis(ctx.Request.Context(), jenis)
	if err != nil {
		res := utils.BuildResponseFailed("gagal membuat jenis/kategori", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("sukses membuat jenis/kategori", result)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) DeleteJenis(ctx *gin.Context) {
	jenisID := ctx.Param("jenis_id")
	id, err := strconv.Atoi(jenisID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	err = c.supplierService.DeleteJenis(ctx.Request.Context(), id)
	if err != nil {
		res := utils.BuildResponseFailed("gagal menghapus jenis/kategori", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("sukses menghapus jenis/kategori", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) GetAllJenis(ctx *gin.Context) {
	result, err := c.supplierService.GetAllJenis(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed("sukses mengambil semua jenis", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("gagal mengambil semua jenis", result)
	ctx.JSON(http.StatusOK, res)
}

func (c *supplierController) DownloadDataSupplier(ctx *gin.Context) {
	result, err := c.supplierService.DownloadDataSupplier(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed("Failed to download data supplier", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Disposition", "attachment; filename=data_supplier.xlsx")
	ctx.Data(http.StatusOK, "application/octet-stream", result)
}
