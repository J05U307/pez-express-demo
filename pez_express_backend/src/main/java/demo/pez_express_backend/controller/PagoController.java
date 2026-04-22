package demo.pez_express_backend.controller;

import demo.pez_express_backend.dto.PagoCrearDTO;
import demo.pez_express_backend.dto.PagoResponseDTO;
import demo.pez_express_backend.entity.Pago;
import demo.pez_express_backend.service.PagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.PublicKey;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {
    private final PagoService pagoService;
    public  PagoController (PagoService pagoService){
        this.pagoService = pagoService;
    }

    // Crear:
    @PostMapping
    public ResponseEntity<PagoResponseDTO> craarPago(@RequestBody PagoCrearDTO dto){
        return ResponseEntity.ok(pagoService.crear(dto));
    }
    // Listar:
    @GetMapping
    public ResponseEntity<List<PagoResponseDTO>> listarPagos(){
        return ResponseEntity.ok(pagoService.listar());
    }

    @GetMapping("/dia")
    public List<PagoResponseDTO> listarPorDia(@RequestParam LocalDate fecha){
        return pagoService.listarPorDia(fecha);
    }

}
