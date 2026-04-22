package demo.pez_express_backend.controller;

import demo.pez_express_backend.dto.ConfiguracionDTO;
import demo.pez_express_backend.service.ConfiguracionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    private final ConfiguracionService service;

    public ConfiguracionController(ConfiguracionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ConfiguracionDTO> obtener() {
        return ResponseEntity.ok(service.obtener());
    }

    @PutMapping
    public ResponseEntity<ConfiguracionDTO> actualizar(@RequestBody ConfiguracionDTO dto) {
        return ResponseEntity.ok(service.actualizar(dto));
    }
}