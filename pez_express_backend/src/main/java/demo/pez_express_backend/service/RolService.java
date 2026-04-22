package demo.pez_express_backend.service;

import demo.pez_express_backend.entity.Rol;

import java.util.List;
import java.util.Optional;

public interface RolService {

    Rol crear(Rol rol);
    Rol actualizar(Rol rol);
    void eliminar(Long id);
    List<Rol> listar();
    Optional<Rol> listarPorId(Long id);

}
