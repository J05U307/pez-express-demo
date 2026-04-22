package demo.pez_express_backend.service;

import demo.pez_express_backend.dto.PedidoCrearDTO;
import demo.pez_express_backend.dto.PedidoResponseDTO;
import demo.pez_express_backend.entity.Pedido;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PedidoService {

    PedidoResponseDTO crear(PedidoCrearDTO dto);
    PedidoResponseDTO actualizar(Long id, PedidoCrearDTO pedido);
    void eliminar(Long id);
    List<PedidoResponseDTO> listar();
    PedidoResponseDTO listarPorId(Long id);

    PedidoResponseDTO cancelar(Long id);

    List<PedidoResponseDTO> listarAbiertosHoy();


    List<PedidoResponseDTO> listarPorFecha(LocalDate fecha);
}
