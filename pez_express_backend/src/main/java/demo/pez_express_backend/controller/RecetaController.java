package demo.pez_express_backend.controller;

import demo.pez_express_backend.dto.ProductoRecetaResponseDTO;
import demo.pez_express_backend.dto.RecetaCrearDTO;
import demo.pez_express_backend.dto.RecetaResponseDTO;
import demo.pez_express_backend.entity.Receta;
import demo.pez_express_backend.service.RecetaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recetas")
public class RecetaController {

    private final RecetaService recetaService;

    public RecetaController(RecetaService recetaService) {
        this.recetaService = recetaService;
    }

    // CRear :
    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody RecetaCrearDTO dto) {
        recetaService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // LIstar
    @GetMapping
    public ResponseEntity<List<ProductoRecetaResponseDTO>> listar() {
        return ResponseEntity.ok(recetaService.listar());
    }

    // LISTAR POR PRODUCTO
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<ProductoRecetaResponseDTO> listarPorProducto(@PathVariable Long idProducto) {
        return ResponseEntity.ok(recetaService.listarPorProducto(idProducto));
    }

    @PutMapping
    public ResponseEntity<Void> actualizar(@RequestBody RecetaCrearDTO dto) {
        recetaService.actualizar(dto);
        return ResponseEntity.ok().build();
    }
}
