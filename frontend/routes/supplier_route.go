package routes

import (
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
)

func Supplier(route *gin.Engine, supplierController controller.SupplierController, jwtService service.JWTService) {
	routes := route.Group("/api/supplier")
	{
		// Supplier
		routes.GET("/index", middleware.Authenticate(jwtService), supplierController.Index)
		routes.POST("", middleware.Authenticate(jwtService), supplierController.CreateSupplier)
		routes.GET("", middleware.Authenticate(jwtService), supplierController.GetAllSupplier)
		routes.GET("/:supplier_id", middleware.Authenticate(jwtService), supplierController.GetSupplierByID)
		routes.PATCH("/:supplier_id", middleware.Authenticate(jwtService), supplierController.UpdateSupplier)
		routes.PATCH("/supply/:supplier_id", middleware.Authenticate(jwtService), supplierController.UpdateSupplierSupply)
		routes.DELETE("/:supplier_id", middleware.Authenticate(jwtService), supplierController.DeleteSupplier)
		routes.GET("/download", middleware.Authenticate(jwtService), supplierController.DownloadDataSupplier)

	}
}
