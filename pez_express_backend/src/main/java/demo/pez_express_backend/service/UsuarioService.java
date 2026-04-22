package demo.pez_express_backend.service;

import demo.pez_express_backend.dto.CambiarPasswordDTO;
import demo.pez_express_backend.dto.RegisterRequest;
import demo.pez_express_backend.dto.UsuarioListDTO;
import demo.pez_express_backend.entity.Usuario;
import demo.pez_express_backend.enums.Estado;

import java.util.List;
import java.util.Optional;

public interface UsuarioService {

    Usuario crear(RegisterRequest usuario);
    Usuario actualizar(Long id, Usuario usuario);
    void eliminar(Long id);
    List<UsuarioListDTO> listar();
    Optional<Usuario> listarPorId(Long id);

    void cambiarEstado(Long id, Estado estado);


    Usuario actualizarPassword(CambiarPasswordDTO dto);


}
