package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.dto.ComandaResponseDTO;
import demo.pez_express_backend.entity.ComandaCocina;
import demo.pez_express_backend.entity.Pedido;
import demo.pez_express_backend.entity.Producto;
import demo.pez_express_backend.enums.EstadoPedido;
import demo.pez_express_backend.enums.TipoComanda;
import demo.pez_express_backend.repository.ComandaCocinaRepository;
import demo.pez_express_backend.service.ComandaService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComandaCocinaServiceImpl implements ComandaService {

    private final ComandaCocinaRepository comandaRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ComandaCocinaServiceImpl(ComandaCocinaRepository comandaRepository,
                                    SimpMessagingTemplate messagingTemplate) {
        this.comandaRepository = comandaRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void enviarComanda(Pedido pedido, Producto producto,
                              int cantidad, TipoComanda tipo, String observacion) {
        ComandaCocina comanda = new ComandaCocina();
        comanda.setPedido(pedido);
        comanda.setProducto(producto);
        comanda.setCantidad(cantidad);
        comanda.setTipo(tipo);
        comanda.setFechaHora(LocalDateTime.now());
        comanda.setObservacion(observacion);
        comandaRepository.save(comanda);
    }

    @Override
    public List<ComandaResponseDTO> listarActivas() {
        // Antes: solo NUEVO
        // Ahora: NUEVO + CANCELADO — ambos de pedidos ABIERTO
        // Cuando el pedido se paga pasa a PAGADO y desaparecen solos
        return comandaRepository
                .findByPedidoEstadoAndTipoInOrderByFechaHoraAsc(
                        EstadoPedido.ABIERTO,
                        List.of(TipoComanda.NUEVO, TipoComanda.CANCELADO)
                )
                .stream()
                .map(this::convertir)
                .toList();
    }

    @Override
    public void notificarCocina() {
        List<ComandaResponseDTO> activas = listarActivas();
        messagingTemplate.convertAndSend("/topic/cocina", activas);
    }


    // ComandaCocinaServiceImpl.java

    @Override
    public void actualizarObservacionComanda(Pedido pedido, Producto producto, String observacion) {
        List<ComandaCocina> existentes = comandaRepository
                .findNuevosByPedidoAndProducto(
                        pedido.getIdPedido(),
                        producto.getIdProducto()
                );

        if (!existentes.isEmpty()) {
            // Actualizar la más reciente — no crear una nueva
            ComandaCocina comanda = existentes.get(0);
            comanda.setObservacion(observacion);
            comandaRepository.save(comanda);
        } else {
            // No existe comanda previa — crear una nueva normalmente
            enviarComanda(pedido, producto,
                    pedido.getDetallePedidos().stream()
                            .filter(d -> d.getProducto().getIdProducto()
                                    .equals(producto.getIdProducto()))
                            .findFirst()
                            .map(d -> d.getCantidad())
                            .orElse(1),
                    TipoComanda.NUEVO, observacion);
        }
    }


    private ComandaResponseDTO convertir(ComandaCocina c) {
        Long idMesa = c.getPedido().getMesa() != null
                ? c.getPedido().getMesa().getIdMesa()
                : null;
        return new ComandaResponseDTO(
                c.getIdComanda(),
                c.getPedido().getIdPedido(),
                idMesa,
                c.getProducto().getNombre(),
                c.getCantidad(),
                c.getTipo(),
                c.getFechaHora(),
                c.getObservacion()
        );
    }
}