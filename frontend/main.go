package main

import (
	"log"
	"os"

	"bumisubur-be/config"
	"bumisubur-be/controller"
	"bumisubur-be/middleware"
	"bumisubur-be/migrations"
	"bumisubur-be/repository"
	"bumisubur-be/routes"
	"bumisubur-be/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func main() {
	var (
		db         *gorm.DB           = config.SetUpDatabaseConnection()
		jwtService service.JWTService = service.NewJWTService()

		logAksesRepository repository.LogAksesRepository = repository.NewLogAksesRepository(db)
		logAksesService    service.LogAksesService       = service.NewLogAksesService(logAksesRepository)
		logAksesController controller.LogAksesController = controller.NewLogAksesController(logAksesService)

		userRepository repository.UserRepository = repository.NewUserRepository(db)
		userService    service.UserService       = service.NewUserService(userRepository, logAksesRepository, jwtService)
		userController controller.UserController = controller.NewUserController(userService)

		pengeluaranRepository repository.PengeluaranRepository = repository.NewPengeluaranRepository(db)
		pengeluaranService    service.PengeluaranService       = service.NewPengeluaranService(pengeluaranRepository)
		pengeluaranController controller.PengeluaranController = controller.NewPengeluaranController(pengeluaranService)

		cabangRepository repository.CabangRepository = repository.NewCabangRepository(db)
		cabangService    service.CabangService       = service.NewCabangService(cabangRepository, jwtService)
		cabangController controller.CabangController = controller.NewCabangController(cabangService)

		jenisRepository repository.JenisRepository = repository.NewJenisRepository(db)
		merkRepository  repository.MerkRepository  = repository.NewMerkRepository(db)

		supplierRepository repository.SupplierRepository = repository.NewSupplierRepository(db)
		supplierService    service.SupplierService       = service.NewSupplierService(supplierRepository, jenisRepository, merkRepository, jwtService)
		supplierController controller.SupplierController = controller.NewSupplierController(supplierService)

		produkRepository repository.ProdukRepository = repository.NewProdukRepository(db)
		produkService    service.ProdukService       = service.NewProdukService(produkRepository, jenisRepository, merkRepository, supplierRepository)
		produkController controller.ProdukController = controller.NewProdukController(produkService)

		transaksiRepository repository.TransaksiRepository = repository.NewTransaksiRepository(db)
		transaksiService    service.TransaksiService       = service.NewTransaksiService(transaksiRepository, jwtService)
		transaksiController controller.TransaksiController = controller.NewTransaksiController(transaksiService)

		returnRepository repository.ReturnRepository = repository.NewReturnRepository(db)
		returnService    service.ReturnService       = service.NewReturnService(returnRepository, jenisRepository, merkRepository, supplierRepository)
		returnController controller.ReturnController = controller.NewReturnController(returnService)
	)

	server := gin.Default()
	server.Use(middleware.CORSMiddleware())
	server.Use(middleware.LogUserActivityMiddleware(logAksesService, jwtService))

	routes.Pengeluaran(server, pengeluaranController, jwtService)
	routes.LogAkses(server, logAksesController, jwtService)
	routes.User(server, userController, jwtService)
	routes.Cabang(server, cabangController, jwtService)
	routes.Supplier(server, supplierController, jwtService)
	routes.Jenis(server, supplierController, jwtService)
	routes.Produk(server, produkController, jwtService)
	routes.Transaksi(server, transaksiController, jwtService)
	routes.Return(server, returnController, jwtService)

	if err := migrations.Seeder(db); err != nil {
		log.Fatalf("error migration seeder: %v", err)
	}

	if err := migrations.Migrate(db); err != nil {
		log.Fatalf("error migration: %v", err)
	}

	server.Static("/assets", "./assets")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8888"
	}

	if err := server.Run(":" + port); err != nil {
		log.Fatalf("error running server: %v", err)
	}
}
