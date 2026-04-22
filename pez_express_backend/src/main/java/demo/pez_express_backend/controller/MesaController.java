package demo.pez_express_backend.controller;

import demo.pez_express_backend.entity.Mesa;
import demo.pez_express_backend.service.MesaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mesas")
public class MesaController {

    private final MesaService mesaService;
    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    // Crear:
    @PostMapping
    public ResponseEntity<Mesa> crearMesa() {
        return ResponseEntity.ok(mesaService.crear());
    }

    //Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Mesa> actualizarMesa(
            @PathVariable Long id,
            @RequestBody Mesa mesa
    ) {
        return ResponseEntity.ok(mesaService.actualizar(id, mesa));
    }

    //Acualizar Estado
    @PutMapping("/actualizar_disponibilidad/{id}")
    public ResponseEntity<Mesa> actulizarDisponibilidad(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(mesaService.actualizarDiposponibilidaEstado(id));
    }

    // Listar
    @GetMapping
    public ResponseEntity<List<Mesa>> listarMesas() {
        return ResponseEntity.ok(mesaService.listar());
    }



}
