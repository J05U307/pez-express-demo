package demo.pez_express_backend.controller;


import demo.pez_express_backend.dto.ComandaResponseDTO;
import demo.pez_express_backend.service.ComandaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cocina")
public class ComandaCocinaController {

    private final ComandaService comandaCocinaService;

    public ComandaCocinaController(ComandaService comandaCocinaService) {
        this.comandaCocinaService = comandaCocinaService;
    }

    @GetMapping("/comandas/activas")
    public ResponseEntity<List<ComandaResponseDTO>> activas() {
        return ResponseEntity.ok(comandaCocinaService.listarActivas());
    }
}