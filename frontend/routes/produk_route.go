package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func Produk(route *gin.Engine, produkController controller.ProdukController, jwtService service.JWTService) {
	routes := route.Group("/api/produk")
	{
		// User

		routes.GET("", middleware.Authenticate(jwtService), produkController.GetAllStokProduk)
		routes.GET("/:id", middleware.Authenticate(jwtService), produkController.GetProdukDetails)

		routes.GET("/index", middleware.Authenticate(jwtService), produkController.IndexRestokProduk)
		routes.GET("/index-old", middleware.Authenticate(jwtService), produkController.IndexOldProduk)

		routes.POST("/create", middleware.Authenticate(jwtService), produkController.CreateProduk)
		routes.POST("/create-old", middleware.Authenticate(jwtService), produkController.CreateOldProduk)

		routes.GET("/pending", middleware.Authenticate(jwtService), produkController.GetPendingProduks)
		routes.GET("/pending/:id", middleware.Authenticate(jwtService), produkController.GetDetailedPendingProduks)
		routes.PATCH("/pending", middleware.Authenticate(jwtService), produkController.UpdateDetailedPendingProduks)
		routes.DELETE("/pending/:id", middleware.Authenticate(jwtService), produkController.DeleteDetailedPendingProduks)
		routes.POST("/pending/insert/:id", middleware.Authenticate(jwtService), produkController.InsertProduk)

		routes.GET("/restok-history", middleware.Authenticate(jwtService), produkController.GetAllRestok)
		routes.GET("/index-final-stok", middleware.Authenticate(jwtService), produkController.GetIndexFinalStok)
		routes.GET("/final-stok", middleware.Authenticate(jwtService), produkController.FinalStokProduk)

	}
}
