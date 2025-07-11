package middleware

import (
	"net/http"
	"strings"

	"bumisubur-be/dto"
	"bumisubur-be/service"
	"bumisubur-be/utils"

	"github.com/gin-gonic/gin"
)

func Authenticate(jwtService service.JWTService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			response := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PROSES_REQUEST, "Authorization Header not found", nil)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, response)
			return
		}

		// Check if Bearer exists and properly remove it
		if !strings.HasPrefix(authHeader, "Bearer ") {
			response := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PROSES_REQUEST, "Authorization header does not contain Bearer", nil)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, response)
			return
		}

		// Trim the Bearer prefix and any surrounding whitespace
		tokenString := strings.TrimSpace(strings.Replace(authHeader, "Bearer ", "", 1))

		// Validate the token
		token, err := jwtService.ValidateToken(tokenString)
		if err != nil {
			response := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PROSES_REQUEST, "Invalid token", nil)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, response)
			return
		}

		// Check if the token is valid
		if !token.Valid {
			response := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PROSES_REQUEST, "Token is not valid", nil)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, response)
			return
		}

		// Get user ID from the token
		userId, err := jwtService.GetUserIDByToken(tokenString)
		if err != nil {
			response := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PROSES_REQUEST, "Could not extract user ID from token", nil)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, response)
			return
		}

		// Pass token and userId to the context
		ctx.Set("token", tokenString)
		ctx.Set("user_id", userId)
		ctx.Next()
	}
}
