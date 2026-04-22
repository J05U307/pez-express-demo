package demo.pez_express_backend.service;

import demo.pez_express_backend.entity.Insumo;

import java.util.List;
import java.util.Optional;

public interface InsumoService {

    Insumo crear(Insumo insumo);
    Insumo actualizar(Long id, Insumo insumo);
    List<Insumo> listar();
    Optional<Insumo> listarPorIdI(Long id);

}
