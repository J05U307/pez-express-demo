package demo.pez_express_backend.controller;

import demo.pez_express_backend.dto.ProductoCrearDTO;
import demo.pez_express_backend.dto.ProductoResponseDTO;
import demo.pez_express_backend.entity.Producto;
import demo.pez_express_backend.service.ProductoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService productoService;
    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // LISTAR:
    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listarProductos() {
        return ResponseEntity.ok(productoService.listar());
    }

    // crear
    @PostMapping
    public ResponseEntity<ProductoResponseDTO> guardar(@RequestBody ProductoCrearDTO dtoProducto) {
        return ResponseEntity.ok(productoService.crear(dtoProducto));
    }

    // editar
    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> actualizarProducto(
            @PathVariable Long id,
            @RequestBody ProductoCrearDTO dtoProducto
    ) {
        return ResponseEntity.ok(productoService.actualizar(id, dtoProducto));
    }

    // LISTAR PRODUCTOS  MANEJO DE STOCK: FALSE

    @GetMapping("/sin-stock")
    public ResponseEntity<List<ProductoResponseDTO>> listarSinStock() {
        return ResponseEntity.ok(productoService.listarSinStock());
    }

}
