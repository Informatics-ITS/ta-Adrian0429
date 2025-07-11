package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func LogAkses(route *gin.Engine, aksesController controller.LogAksesController, jwtService service.JWTService) {
	routes := route.Group("/api/log")
	{
		routes.GET("", middleware.Authenticate(jwtService), aksesController.GetAll)
		routes.GET("/download", middleware.Authenticate(jwtService), aksesController.Download)
	}
}
