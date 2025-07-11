package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func User(route *gin.Engine, userController controller.UserController, jwtService service.JWTService) {
	routes := route.Group("/api/user")
	{
		// User
		routes.POST("/login", userController.Login)
		routes.POST("", middleware.Authenticate(jwtService), userController.Register)
		routes.GET("", middleware.Authenticate(jwtService), userController.GetAllUser)
		routes.GET("/me", middleware.Authenticate(jwtService), userController.Me)
		routes.DELETE("/:user_id", middleware.Authenticate(jwtService), userController.Delete)
		routes.PATCH("/:user_id", middleware.Authenticate(jwtService), userController.Update)
		routes.GET("/:user_id", middleware.Authenticate(jwtService), userController.GetUserById)
		routes.GET("/download", middleware.Authenticate(jwtService), userController.DownloadDataKaryawan)
	}
}


