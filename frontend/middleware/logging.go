package middleware

import (
	"bumisubur-be/dto"
	"bumisubur-be/entity"
	"bumisubur-be/service"
	"bumisubur-be/utils"
	"bytes"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func LogUserActivityMiddleware(logAksesService service.LogAksesService, jwtService service.JWTService) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		if ctx.Request.URL.Path == "/api/user/login" {
			ctx.Next()
			return
		}

		token := ctx.GetHeader("Authorization")
		if !strings.HasPrefix(token, "Bearer ") {
			response := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PROSES_REQUEST, "Authorization header does not contain Bearer", nil)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, response)
			return
		}

		tokenString := strings.TrimSpace(strings.Replace(token, "Bearer ", "", 1))
		// Read the request body
		bodyBytes, err := io.ReadAll(ctx.Request.Body)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to read request body"})
			return
		}

		// Restore the request body so it can be read again by subsequent handlers
		ctx.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		userID, err := jwtService.GetUserIDByToken(tokenString)
		if err != nil {
			res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_DENIED_ACCESS, err.Error(), nil)
			ctx.JSON(http.StatusUnauthorized, res)
			ctx.Abort()
			return
		}

		ctx.Next()

		statusCode := ctx.Writer.Status()
		id, _ := strconv.Atoi(userID)
		logAksesID := logAksesService.GetActiveLogAksesForUser(ctx, id)
		var payload string
		if ctx.Request.URL.RawQuery != "" {
			payload = ctx.Request.URL.RawQuery
		} else {
			payload = string(bodyBytes)
		}

		detailAkses := entity.DetailAkses{
			Activity:   ctx.Request.URL.Path,
			LogAksesID: logAksesID,
			Token:      tokenString,
			IP:         ctx.ClientIP(),
			Payload:    payload,
			Status:     strconv.Itoa(statusCode),
		}

		logAksesService.LogDetailAkses(ctx, detailAkses)
	}
}
