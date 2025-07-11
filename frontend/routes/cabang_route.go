package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func Cabang(route *gin.Engine, cabangController controller.CabangController, jwtService service.JWTService) {
	routes := route.Group("/api/cabang")
	{
		// Cabang
		routes.POST("", middleware.Authenticate(jwtService), cabangController.CreateCabang)
		routes.GET("", middleware.Authenticate(jwtService), cabangController.GetAllCabang)
		routes.GET("/:cabang_id", middleware.Authenticate(jwtService), cabangController.GetCabangByID)
		routes.PATCH("/:cabang_id", middleware.Authenticate(jwtService), cabangController.UpdateCabang)
		routes.DELETE("/:cabang_id", middleware.Authenticate(jwtService), cabangController.DeleteCabang)
		routes.GET("/download", middleware.Authenticate(jwtService), cabangController.DownloadDataCabang)
	}
}
