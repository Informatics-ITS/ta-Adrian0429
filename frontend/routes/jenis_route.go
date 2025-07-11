package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func Jenis(route *gin.Engine, supplierController controller.SupplierController, jwtService service.JWTService) {
	routes := route.Group("/api/jenis")
	{
		routes.POST("", middleware.Authenticate(jwtService), supplierController.CreateJenis)
		routes.GET("", middleware.Authenticate(jwtService), supplierController.GetAllJenis)
		// routes.GET("/:supplier_id", middleware.Authenticate(jwtService), supplierController.GetSupplierByID)
		// routes.PATCH("/:supplier_id", middleware.Authenticate(jwtService), supplierController.UpdateSupplier)
		routes.DELETE("/:jenis_id", middleware.Authenticate(jwtService), supplierController.DeleteJenis)
	}
}
