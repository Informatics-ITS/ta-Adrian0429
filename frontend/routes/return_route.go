package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func Return(route *gin.Engine, returnController controller.ReturnController, jwtService service.JWTService) {
	routes := route.Group("/api/return")
	{
		// User
		routes.GET("/user/:nota_id", middleware.Authenticate(jwtService), returnController.GetReturnUser)
		routes.GET("/supplier/:restok_id", middleware.Authenticate(jwtService), returnController.GetReturnSupplier)

		routes.GET("/history/user", middleware.Authenticate(jwtService), returnController.GetHistoryRestokUser)
		routes.GET("/history/supplier", middleware.Authenticate(jwtService), returnController.GetHistoryRestokSupplier)

		routes.POST("/user", middleware.Authenticate(jwtService), returnController.CreateReturnUser)
		routes.POST("/supplier", middleware.Authenticate(jwtService), returnController.CreateReturnSupplier)

	}
}
