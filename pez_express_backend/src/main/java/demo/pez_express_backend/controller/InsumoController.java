package demo.pez_express_backend.controller;

import demo.pez_express_backend.entity.Insumo;
import demo.pez_express_backend.service.InsumoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
public class InsumoController {
    private final InsumoService insumoService;
    public InsumoController(InsumoService insumoService){
        this.insumoService= insumoService;
    }

    //CREAR:
    @PostMapping
    public ResponseEntity<Insumo> crearInsumo(@RequestBody Insumo insumo){
        return ResponseEntity.ok(insumoService.crear(insumo));
    }

    @GetMapping
    public ResponseEntity<List<Insumo>> listarInsumos(){
        return ResponseEntity.ok(insumoService.listar());
    }

    // Editar:
    @PutMapping("{id}")
    public ResponseEntity<Insumo> editarInsumo(
            @RequestBody Insumo insumo,
            @PathVariable Long id
            ){
        return  ResponseEntity.ok(insumoService.actualizar(id, insumo));

    }

}

