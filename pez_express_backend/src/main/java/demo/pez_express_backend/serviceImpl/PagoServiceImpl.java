package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.dto.DetallePagoDTO;
import demo.pez_express_backend.dto.PagoCrearDTO;
import demo.pez_express_backend.dto.PagoResponseDTO;
import demo.pez_express_backend.entity.*;
import demo.pez_express_backend.enums.EstadoPedido;
import demo.pez_express_backend.event.CocinaNotificacionEvent;
import demo.pez_express_backend.exception.BadRequestException;
import demo.pez_express_backend.exception.NotFoundException;
import demo.pez_express_backend.repository.PagoRepositoy;
import demo.pez_express_backend.repository.PedidoRepository;
import demo.pez_express_backend.repository.UsuarioRepository;
import demo.pez_express_backend.service.ComandaService;
import demo.pez_express_backend.service.MesaService;
import demo.pez_express_backend.service.PagoService;
import demo.pez_express_backend.service.UsuarioService;
import jakarta.transaction.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagoServiceImpl implements PagoService {

    private final PagoRepositoy pagoRepositoy;
    private final PedidoRepository pedidoRepository;
    private final MesaService mesaService;
    private final UsuarioRepository usuarioRepository;
    private final ComandaService comandaService; // ← AGREGAR
    private final ApplicationEventPublisher eventPublisher;


    public PagoServiceImpl(
            UsuarioRepository usuarioRepository,
            PagoRepositoy pagoRepositoy,
            PedidoRepository pedidoRepository,
            MesaService mesaService,
            ComandaService comandaService,  // ← AGREGAR
            ApplicationEventPublisher eeventPublisher
    ) {
        this.usuarioRepository = usuarioRepository;
        this.pagoRepositoy = pagoRepositoy;
        this.pedidoRepository = pedidoRepository;
        this.mesaService = mesaService;
        this.comandaService = comandaService; // ← AGREGAR
        this.eventPublisher = eeventPublisher;
    }


    @Override
    @Transactional
    public PagoResponseDTO crear(PagoCrearDTO dto) {

        Pedido pedido = pedidoRepository.findById(dto.getIdPedido())
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));

        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            throw new BadRequestException("Este pedido ya fue pagado.");
        }

        if (pedido.getEstado() != EstadoPedido.ABIERTO) {
            throw new BadRequestException("El pedido no se encuentra en estado ABIERTO.");
        }

        if (dto.getDetallePagos() == null || dto.getDetallePagos().isEmpty()) {
            throw new BadRequestException("Debe enviar al menos un método de pago.");
        }

        double suma = dto.getDetallePagos()
                .stream()
                .mapToDouble(DetallePagoDTO::getMonto)
                .sum();

        if (Double.compare(suma, pedido.getTotal()) != 0) {
            throw new BadRequestException("La suma de los montos no coincide con el total del pedido.");
        }

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuarioCobro())
                .orElseThrow(()-> new NotFoundException("Usuario que cobro no encontrado"));

        Pago nuevoPago = new Pago();
        nuevoPago.setPedido(pedido);
        nuevoPago.setTotal(pedido.getTotal());
        nuevoPago.setFechaHora(LocalDateTime.now());
        nuevoPago.setUsuario(usuario);

        List<DetallePago> detalles = dto.getDetallePagos()
                .stream()
                .map(detalleDTO -> {
                    DetallePago detalle = new DetallePago();
                    detalle.setMetodoPago(detalleDTO.getMetodoPago());
                    detalle.setMonto(detalleDTO.getMonto());
                    detalle.setPago(nuevoPago);
                    return detalle;
                })
                .toList();

        nuevoPago.setDetallePagos(detalles);

        pedido.setEstado(EstadoPedido.PAGADO);

        Mesa mesa = pedido.getMesa();
        if (mesa != null) {
            mesaService.actualizarDiposponibilidaEstado(mesa.getIdMesa());
        }

        Pago pagoGuardado = pagoRepositoy.save(nuevoPago);

        eventPublisher.publishEvent(new CocinaNotificacionEvent("PAGO"));

        return convertToDTO(pagoGuardado);
    }

    @Override
    public List<PagoResponseDTO> listar() {
        return pagoRepositoy.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<PagoResponseDTO> listarPorDia(LocalDate fecha){
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(23,59,59);
        return pagoRepositoy.findByFechaHoraBetween(inicio, fin)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }



    private PagoResponseDTO convertToDTO(Pago pago){
        PagoResponseDTO dto = new PagoResponseDTO();
        dto.setIdPago(pago.getIdPago());
        dto.setIdPedido(pago.getPedido().getIdPedido());
        dto.setTotal(pago.getTotal());
        dto.setFechaHora(pago.getFechaHora());
        dto.setIdUsuarioCobro(pago.getUsuario().getIdUsuario());
        dto.setNombreUsuarioCobro(pago.getUsuario().getNombre());
        List<DetallePagoDTO> detalles = pago.getDetallePagos()
                .stream()
                .map(detalle -> {
                    DetallePagoDTO detalleDTO = new DetallePagoDTO();
                    detalleDTO.setMetodoPago(detalle.getMetodoPago());
                    detalleDTO.setMonto(detalle.getMonto());
                    return detalleDTO;
                })
                .toList();
        dto.setDetallePago(detalles);
        return dto;
    }

}
