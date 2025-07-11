package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func Transaksi(route *gin.Engine, transaksiController controller.TransaksiController, jwtService service.JWTService) {
	routes := route.Group("/api/transaksi")
	{
		routes.GET("/print/:id", transaksiController.PrintMobile)
		routes.POST("", middleware.Authenticate(jwtService), transaksiController.CreateTransaksi)
		routes.GET("", middleware.Authenticate(jwtService), transaksiController.GetHistoryTransaksi)
		routes.GET("/index", middleware.Authenticate(jwtService), transaksiController.Index)
		routes.GET("/download", middleware.Authenticate(jwtService), transaksiController.DownloadData)
	}
}
