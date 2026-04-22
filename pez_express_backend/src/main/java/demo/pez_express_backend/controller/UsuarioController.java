package demo.pez_express_backend.controller;

import demo.pez_express_backend.dto.CambiarPasswordDTO;
import demo.pez_express_backend.dto.RegisterRequest;
import demo.pez_express_backend.dto.UsuarioListDTO;
import demo.pez_express_backend.entity.Usuario;
import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Crear

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        usuarioService.crear(request);
        return ResponseEntity.ok(request);
    }

    /**
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody Usuario user
    ) {
        return ResponseEntity.ok(usuarioService.actualizar(id, user));
    }
     */

    @PatchMapping("/cambiar_password")
    public ResponseEntity<?> cambiarPassword (@RequestBody CambiarPasswordDTO dto){
           usuarioService.actualizarPassword(dto);
            return ResponseEntity.ok("Password cambiado con exito");
    }


    //Listar
    @GetMapping
    public ResponseEntity<List<UsuarioListDTO>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listar());
    }


    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Estado estado) {

        usuarioService.cambiarEstado(id, estado);
        return ResponseEntity.ok().build();
    }



    // LISTAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> listarPorId(@PathVariable Long id) {

        return usuarioService.listarPorId(id)
                .map(usuario -> ResponseEntity.ok(usuario))
                .orElse(ResponseEntity.notFound().build());
    }

}
