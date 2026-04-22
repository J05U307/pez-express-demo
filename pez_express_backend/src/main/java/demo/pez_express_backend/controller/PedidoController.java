package demo.pez_express_backend.controller;

import demo.pez_express_backend.dto.PedidoCrearDTO;
import demo.pez_express_backend.dto.PedidoResponseDTO;
import demo.pez_express_backend.entity.Pedido;
import demo.pez_express_backend.service.PedidoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // Crear
    @PostMapping
    public ResponseEntity<PedidoResponseDTO> crear(@RequestBody PedidoCrearDTO pedido) {
        return ResponseEntity.ok(pedidoService.crear(pedido));
    }


    @PutMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> actualizar(
            @PathVariable Long id,
            @RequestBody PedidoCrearDTO dto
    ) {
        return ResponseEntity.ok(pedidoService.actualizar(id, dto));
    }

    // Listar por id
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.listarPorId(id));
    }

    //Listar todo:
    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarTodosPedidos(){
        return ResponseEntity.ok(pedidoService.listar());
    }

    // En PedidoController
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponseDTO> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.cancelar(id));
    }

    // Listar abiertos del día
    @GetMapping("/abiertos-hoy")
    public ResponseEntity<List<PedidoResponseDTO>> listarAbiertosHoy() {
        return ResponseEntity.ok(pedidoService.listarAbiertosHoy());
    }


    @GetMapping("/por-fecha")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(pedidoService.listarPorFecha(fecha));
    }

}
