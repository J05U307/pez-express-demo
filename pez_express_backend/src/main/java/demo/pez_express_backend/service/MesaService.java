package demo.pez_express_backend.service;

import demo.pez_express_backend.entity.Mesa;

import java.util.List;
import java.util.Optional;

public interface MesaService {

    Mesa crear();
    Mesa actualizar(Long id, Mesa mesa);
    void eliminar(Long id);
    Optional<Mesa> listarPorId(Long id);
    List<Mesa> listar();

    // Actulizar estado de mesa
    Mesa actualizarDiposponibilidaEstado(Long id);

}
