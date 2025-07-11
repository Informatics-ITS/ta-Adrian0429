package controller

import (
	"net/http"
	"strconv"

	"bumisubur-be/dto"
	"bumisubur-be/service"
	"bumisubur-be/utils"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
)

type (
	UserController interface {
		Register(ctx *gin.Context)
		Login(ctx *gin.Context)
		GetUserById(ctx *gin.Context)
		GetAllUser(ctx *gin.Context)
		Me(ctx *gin.Context)
		// SendVerificationEmail(ctx *gin.Context)
		// VerifyEmail(ctx *gin.Context)
		Update(ctx *gin.Context)
		Delete(ctx *gin.Context)
		DownloadDataKaryawan(ctx *gin.Context)
	}

	userController struct {
		userService service.UserService
	}
)

func NewUserController(us service.UserService) UserController {
	return &userController{
		userService: us,
	}
}

func (c *userController) Register(ctx *gin.Context) {
	var user dto.UserCreateRequest
	if err := ctx.ShouldBind(&user); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}
	if validationErr := validator.New().Struct(user); validationErr != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, validationErr.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.userService.RegisterUser(ctx.Request.Context(), user)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_REGISTER_USER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_REGISTER_USER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *userController) GetAllUser(ctx *gin.Context) {
	var req dto.PaginationRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.userService.GetAllUserWithPagination(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_LIST_USER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	resp := utils.Response{
		Status:  true,
		Message: dto.MESSAGE_SUCCESS_GET_LIST_USER,
		Data:    result,
	}

	ctx.JSON(http.StatusOK, resp)
}

func (c *userController) GetUserById(ctx *gin.Context) {
	userId := ctx.Param("user_id")

	id, err := strconv.Atoi(userId)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.userService.GetUserById(ctx.Request.Context(), id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_USER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_USER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *userController) Me(ctx *gin.Context) {
	userIDStr := ctx.MustGet("user_id").(string)
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user_id format"})
		return
	}
	result, err := c.userService.GetUserById(ctx.Request.Context(), userID)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_USER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_GET_USER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *userController) Login(ctx *gin.Context) {
	var req dto.UserLoginRequest
	if err := ctx.ShouldBind(&req); err != nil {
		response := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, response)
		return
	}

	result, err := c.userService.Verify(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_LOGIN, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_LOGIN, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *userController) Update(ctx *gin.Context) {
	var req dto.UserCreateRequest
	if err := ctx.ShouldBind(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	userId := ctx.Param("user_id")
	id, err := strconv.Atoi(userId)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	result, err := c.userService.UpdateUser(ctx.Request.Context(), req, id)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_UPDATE_USER, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_UPDATE_USER, result)
	ctx.JSON(http.StatusOK, res)
}

func (c *userController) Delete(ctx *gin.Context) {
	userId := ctx.Param("user_id")

	id, err := strconv.Atoi(userId)
	if err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_CABANG_BY_ID, "Invalid cabang ID", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	if err := c.userService.DeleteUser(ctx.Request.Context(), id); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DELETE_USER, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_DELETE_USER, nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *userController) DownloadDataKaryawan(ctx *gin.Context) {
	result, err := c.userService.DownloadDataKaryawan(ctx.Request.Context())
	if err != nil {
		res := utils.BuildResponseFailed("gagal download data karyawan", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Disposition", "attachment; filename=data_cabang.xlsx")
	ctx.Data(http.StatusOK, "application/octet-stream", result)
}
