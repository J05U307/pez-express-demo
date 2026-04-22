package demo.pez_express_backend.service;

import demo.pez_express_backend.dto.ComandaResponseDTO;
import demo.pez_express_backend.entity.Pedido;
import demo.pez_express_backend.entity.Producto;
import demo.pez_express_backend.enums.TipoComanda;

import java.util.List;

public interface ComandaService {
    void enviarComanda(Pedido pedido, Producto producto, int cantidad, TipoComanda tipo, String observacion);
    List<ComandaResponseDTO> listarActivas();

    void notificarCocina();

    // ComandaService.java
    void actualizarObservacionComanda(Pedido pedido, Producto producto, String observacion);
}
