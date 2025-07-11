package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func Pengeluaran(route *gin.Engine, pengeluaranController controller.PengeluaranController, jwtService service.JWTService) {
	routes := route.Group("/api/pengeluaran")
	{
		routes.POST("", middleware.Authenticate(jwtService), pengeluaranController.CreatePengeluaran)
		routes.GET("", middleware.Authenticate(jwtService), pengeluaranController.GetAllPengeluaran)
		routes.GET("/:pengeluaran_id", middleware.Authenticate(jwtService), pengeluaranController.GetPengeluaranByID)
		routes.PATCH("/:pengeluaran_id", middleware.Authenticate(jwtService), pengeluaranController.UpdatePengeluaran)
		routes.DELETE("/:pengeluaran_id", middleware.Authenticate(jwtService), pengeluaranController.DeletePengeluaran)
		routes.GET("/download", middleware.Authenticate(jwtService), pengeluaranController.DownloadDataPengeluaran)
	}
}
