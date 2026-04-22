package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.dto.DetallePedidoCrearDTO;
import demo.pez_express_backend.dto.DetallePedidoResponseDTO;
import demo.pez_express_backend.dto.PedidoCrearDTO;
import demo.pez_express_backend.dto.PedidoResponseDTO;
import demo.pez_express_backend.entity.*;
import demo.pez_express_backend.enums.*;
import demo.pez_express_backend.event.CocinaNotificacionEvent;
import demo.pez_express_backend.exception.BadRequestException;
import demo.pez_express_backend.exception.ConflictException;
import demo.pez_express_backend.exception.NotFoundException;
import demo.pez_express_backend.repository.*;
import demo.pez_express_backend.service.ComandaService;
import demo.pez_express_backend.service.PedidoService;
import demo.pez_express_backend.service.StockService;
import jakarta.transaction.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final MesaRepository mesaRepository;
    private final ProductoRepositoy productoRepositoy;
    private final DetallePedidoRepositoy detallePedidoRepositoy;
    private final UsuarioRepository usuarioRepository;
    private final RecetaRepository recetaRepository;
    private final ClienteRepository clienteRepository;
    private final StockService stockService;
    private final ComandaService comandaCocinaService;
    private final ConfiguracionRepository configuracionRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PedidoServiceImpl(
            PedidoRepository pedidoRepository,
            MesaRepository mesaRepository,
            ProductoRepositoy productoRepositoy,
            DetallePedidoRepositoy detallePedidoRepositoy,
            UsuarioRepository usuarioRepository,
            RecetaRepository recetaRepository,
            StockService stockService,
            ClienteRepository clienteRepository,
            ComandaService comandaCocinaService,
            ConfiguracionRepository configuracionRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.pedidoRepository = pedidoRepository;
        this.mesaRepository = mesaRepository;
        this.productoRepositoy = productoRepositoy;
        this.detallePedidoRepositoy = detallePedidoRepositoy;
        this.usuarioRepository = usuarioRepository;
        this.recetaRepository = recetaRepository;
        this.stockService = stockService;
        this.clienteRepository = clienteRepository;
        this.comandaCocinaService = comandaCocinaService;
        this.configuracionRepository = configuracionRepository;
        this.eventPublisher = eventPublisher;
    }

    // ─────────────────────────────────────────────
    // CREAR
    // ─────────────────────────────────────────────
    @Override
    @Transactional
    public PedidoResponseDTO crear(PedidoCrearDTO dto) {

        // ── Validar día y horario de atención ────────────────
        configuracionRepository.findById(1L).ifPresent(config -> {

            if (config.getDiasAtencion() != null && !config.getDiasAtencion().isBlank()) {

                String diaHoy = LocalDate.now()
                        .getDayOfWeek()
                        .getDisplayName(java.time.format.TextStyle.FULL,
                                new java.util.Locale("es", "PE"))
                        .toUpperCase();

                // Normalizar: quita tildes para comparar sin problema
                // MIÉRCOLES → MIERCOLES, SÁBADO → SABADO, etc.
                String diaHoyNormalizado = java.text.Normalizer
                        .normalize(diaHoy, java.text.Normalizer.Form.NFD)
                        .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

                List<String> dias = List.of(config.getDiasAtencion().split(","));

                if (!dias.contains(diaHoyNormalizado)) {
                    throw new BadRequestException(
                            "Hoy no hay atención. Días disponibles: " + config.getDiasAtencion()
                    );
                }
            }

            // Validar horario — sin cambios
            if (config.getHoraInicio() != null && config.getHoraFin() != null) {
                LocalTime ahora = LocalTime.now();
                if (ahora.isBefore(config.getHoraInicio()) || ahora.isAfter(config.getHoraFin())) {
                    throw new BadRequestException(
                            "Fuera del horario de atención. Horario: "
                                    + config.getHoraInicio() + " - " + config.getHoraFin()
                    );
                }
            }
        });


        validarTipoPedido(dto);
        Usuario mesero = obtenerMesero(dto.getIdMesero());
        Mesa mesa = validarMesaSiAplica(dto);


        stockService.validarStockPedido(dto.getDetalles());

        Pedido pedido = crearPedidoBase(dto, mesero, mesa);

        double total = 0.0;

        for (DetallePedidoCrearDTO detalleDTO : dto.getDetalles()) {

            Producto producto = productoRepositoy.findById(detalleDTO.getIdProducto())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado"));

            // descontarStockProducto sigue igual — el producto ya está cargado
            stockService.descontarStockProducto(producto, detalleDTO.getCantidad());

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(detalleDTO.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setEstado(EstadoDetallePedido.NUEVO);
            detalle.setFechaHora(LocalDateTime.now());
            detalle.setObservacion(detalleDTO.getObservacion());
            detallePedidoRepositoy.save(detalle);
            pedido.getDetallePedidos().add(detalle);

            if (producto.isImprimeCocina()) {
                comandaCocinaService.enviarComanda(
                        pedido, producto, detalleDTO.getCantidad(),
                        TipoComanda.NUEVO, detalleDTO.getObservacion()
                );
                /////////comandaCocinaService.notificarCocina();
            }

            total += producto.getPrecio() * detalleDTO.getCantidad();
        }

        pedido.setTotal(total);

        if (mesa != null) {
            mesa.setDisponibilidadEstado(EstadoMesa.OCUPADO);
        }

        eventPublisher.publishEvent(new CocinaNotificacionEvent("CREAR"));
        return convertirAPedidoResponseDTO(pedido);
    }

    // ─────────────────────────────────────────────
    // ACTUALIZAR
    // ─────────────────────────────────────────────
    @Override
    @Transactional
    public PedidoResponseDTO actualizar(Long id, PedidoCrearDTO dto) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));

        if (pedido.getEstado() != EstadoPedido.ABIERTO) {
            throw new BadRequestException("Solo se pueden modificar pedidos abiertos.");
        }

        // ── Pre-carga batch de todos los productos nuevos ─────────────
        // Solo los que NO están ya en el pedido actual necesitan una query
        // Los existentes ya vienen dentro de pedido.getDetallePedidos()
        Map<Long, DetallePedido> actuales = pedido.getDetallePedidos() == null
                ? Map.of()
                : pedido.getDetallePedidos().stream()
                .collect(Collectors.toMap(
                        d -> d.getProducto().getIdProducto(), d -> d
                ));

        Map<Long, DetallePedidoCrearDTO> nuevos = dto.getDetalles().stream()
                .collect(Collectors.toMap(DetallePedidoCrearDTO::getIdProducto, d -> d));

        // IDs de productos realmente nuevos (no estaban en el pedido antes)
        List<Long> idsProductosNuevos = nuevos.keySet().stream()
                .filter(idP -> !actuales.containsKey(idP))
                .toList();

        // UNA sola query para todos los productos nuevos
        Map<Long, Producto> productosNuevosCargados = idsProductosNuevos.isEmpty()
                ? Map.of()
                : productoRepositoy.findAllById(idsProductosNuevos)
                .stream()
                .collect(Collectors.toMap(Producto::getIdProducto, p -> p));

        // ── 1. Identificar eliminados ─────────────────────────────────
        List<DetallePedido> aEliminar = actuales.entrySet().stream()
                .filter(e -> !nuevos.containsKey(e.getKey()))
                .map(Map.Entry::getValue)
                .toList();

        // ── 2. Procesar eliminados ────────────────────────────────────
        for (DetallePedido detalle : aEliminar) {
            stockService.devolverStockProducto(detalle.getProducto(), detalle.getCantidad());
            if (detalle.getProducto().isImprimeCocina()) {
                comandaCocinaService.enviarComanda(
                        pedido, detalle.getProducto(), detalle.getCantidad(),
                        TipoComanda.CANCELADO, "Producto eliminado del pedido"
                );
            }

            detallePedidoRepositoy.delete(detalle);
            pedido.getDetallePedidos().remove(detalle);
        }

        // ── 3. Procesar modificados ───────────────────────────────────
        for (Map.Entry<Long, DetallePedido> entry : actuales.entrySet()) {
            Long idProducto = entry.getKey();
            DetallePedido detalleActual = entry.getValue();

            if (!nuevos.containsKey(idProducto)) continue;

            DetallePedidoCrearDTO nuevoDTO = nuevos.get(idProducto);
            int cantidadNueva = nuevoDTO.getCantidad();
            int diferencia = cantidadNueva - detalleActual.getCantidad();
            boolean observacionCambio = !Objects.equals(
                    detalleActual.getObservacion(), nuevoDTO.getObservacion()
            );

            if (diferencia > 0) {
                stockService.descontarStockProducto(detalleActual.getProducto(), diferencia);
                if (detalleActual.getProducto().isImprimeCocina()) {
                    comandaCocinaService.enviarComanda(
                            pedido, detalleActual.getProducto(), diferencia,
                            TipoComanda.NUEVO, nuevoDTO.getObservacion()
                    );
                }
            }

            if (diferencia < 0) {
                stockService.devolverStockProducto(
                        detalleActual.getProducto(), Math.abs(diferencia)
                );
                if (detalleActual.getProducto().isImprimeCocina()) {
                    comandaCocinaService.enviarComanda(
                            pedido, detalleActual.getProducto(), Math.abs(diferencia),
                            TipoComanda.CANCELADO, nuevoDTO.getObservacion()
                    );
                }
            }

            if (diferencia == 0 && observacionCambio
                    && detalleActual.getProducto().isImprimeCocina()) {
                comandaCocinaService.actualizarObservacionComanda(
                        pedido,
                        detalleActual.getProducto(),
                        nuevoDTO.getObservacion()
                );
            }


            detalleActual.setCantidad(cantidadNueva);
            detalleActual.setObservacion(nuevoDTO.getObservacion());
            detallePedidoRepositoy.save(detalleActual);
        }

        // ── 4. Procesar productos nuevos ──────────────────────────────
        // Ya están en memoria — no hay findById() dentro del loop
        for (Long idProducto : idsProductosNuevos) {

            Producto producto = productosNuevosCargados.get(idProducto);
            if (producto == null)
                throw new NotFoundException("Producto no encontrado: " + idProducto);

            DetallePedidoCrearDTO detalleDTO = nuevos.get(idProducto);
            int cantidad = detalleDTO.getCantidad();
            String obs = detalleDTO.getObservacion();

            stockService.descontarStockProducto(producto, cantidad);

            DetallePedido nuevoDetalle = new DetallePedido();
            nuevoDetalle.setPedido(pedido);
            nuevoDetalle.setProducto(producto);
            nuevoDetalle.setCantidad(cantidad);
            nuevoDetalle.setPrecioUnitario(producto.getPrecio());
            nuevoDetalle.setEstado(EstadoDetallePedido.NUEVO);
            nuevoDetalle.setFechaHora(LocalDateTime.now());
            nuevoDetalle.setObservacion(obs);
            detallePedidoRepositoy.save(nuevoDetalle);
            pedido.getDetallePedidos().add(nuevoDetalle);

            if (producto.isImprimeCocina()) {
                comandaCocinaService.enviarComanda(
                        pedido, producto, cantidad, TipoComanda.NUEVO, obs
                );
            }
        }

        recalcularTotal(pedido);

        eventPublisher.publishEvent(new CocinaNotificacionEvent("ACTUALIZAR"));
        return convertirAPedidoResponseDTO(pedido);
    }

    // ─────────────────────────────────────────────
    // CANCELAR
    // ─────────────────────────────────────────────
    @Override
    @Transactional
    public PedidoResponseDTO cancelar(Long id) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));

        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new BadRequestException("El pedido ya está cancelado.");
        }

        for (DetallePedido detalle : pedido.getDetallePedidos()) {

            stockService.devolverStockProducto(detalle.getProducto(), detalle.getCantidad());

            if (detalle.getProducto().isImprimeCocina()) {
                comandaCocinaService.enviarComanda(
                        pedido, detalle.getProducto(), detalle.getCantidad(),
                        TipoComanda.CANCELADO, "Pedido cancelado"
                );
            }
        }

        pedido.setEstado(EstadoPedido.CANCELADO);

        if (pedido.getMesa() != null) {
            pedido.getMesa().setDisponibilidadEstado(EstadoMesa.LIBRE);
        }

        eventPublisher.publishEvent(new CocinaNotificacionEvent("CANCELAR"));
        return convertirAPedidoResponseDTO(pedido);
    }

    @Override
    public List<PedidoResponseDTO> listarAbiertosHoy() {
        return pedidoRepository.findAbiertosHoy()
                .stream()
                .map(this::convertirAPedidoResponseDTO)
                .toList();
    }


    @Override
    public List<PedidoResponseDTO> listarPorFecha(LocalDate fecha) {
        return pedidoRepository.findByFecha(fecha)
                .stream()
                .map(this::convertirAPedidoResponseDTO)
                .toList();
    }

    // ─────────────────────────────────────────────
    // LISTAR
    // ─────────────────────────────────────────────
    @Override
    public List<PedidoResponseDTO> listar() {
        return pedidoRepository.findAll()
                .stream()
                .map(this::convertirAPedidoResponseDTO)
                .toList();
    }

    @Override
    public PedidoResponseDTO listarPorId(Long id) {
        Pedido pedido = pedidoRepository.findByIdConDetalles(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));
        return convertirAPedidoResponseDTO(pedido);
    }


    @Override
    public void eliminar(Long id) {
    }

    // ─────────────────────────────────────────────
    // MÉTODOS PRIVADOS
    // ─────────────────────────────────────────────
    private void validarTipoPedido(PedidoCrearDTO dto) {
        if (dto.getTipoPedido() == null)
            throw new BadRequestException("Debe enviar el tipo de pedido.");
        if (dto.getTipoPedido() == TipoPedido.MESA && dto.getIdMesa() == null)
            throw new BadRequestException("Debe enviar una mesa.");
        if (dto.getTipoPedido() == TipoPedido.LLEVAR && dto.getIdMesa() != null)
            throw new BadRequestException("No debe enviar idMesa para LLEVAR.");
    }

    private Usuario obtenerMesero(Long idMesero) {
        return usuarioRepository.findById(idMesero)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private Mesa validarMesaSiAplica(PedidoCrearDTO dto) {
        if (dto.getTipoPedido() != TipoPedido.MESA) return null;
        Mesa mesa = mesaRepository.findById(dto.getIdMesa())
                .orElseThrow(() -> new NotFoundException("Mesa no encontrada"));
        if (mesa.getDisponibilidadEstado() != EstadoMesa.LIBRE)
            throw new ConflictException("La mesa no está disponible");
        return mesa;
    }

    private Pedido crearPedidoBase(PedidoCrearDTO dto, Usuario mesero, Mesa mesa) {
        Pedido pedido = new Pedido();
        pedido.setFechaApertura(LocalDateTime.now());
        pedido.setEstado(EstadoPedido.ABIERTO);
        pedido.setTotal(0.0);
        pedido.setMesero(mesero);
        pedido.setTipo(dto.getTipoPedido());
        if (mesa != null) pedido.setMesa(mesa);
        return pedidoRepository.save(pedido);
    }

    private void recalcularTotal(Pedido pedido) {
        double total = pedido.getDetallePedidos()
                .stream()
                .mapToDouble(d -> d.getPrecioUnitario() * d.getCantidad())
                .sum();
        pedido.setTotal(total);
    }

    private PedidoResponseDTO convertirAPedidoResponseDTO(Pedido pedido) {
        List<DetallePedidoResponseDTO> detallesDTO = pedido.getDetallePedidos()
                .stream()
                .map(d -> new DetallePedidoResponseDTO(
                        d.getProducto().getNombre(),
                        d.getCantidad(),
                        d.getPrecioUnitario(),
                        d.getPrecioUnitario() * d.getCantidad(),
                        d.getObservacion()
                ))
                .toList();

        Long idMesa = pedido.getMesa() != null ? pedido.getMesa().getIdMesa() : null;

        return new PedidoResponseDTO(
                pedido.getIdPedido(),
                pedido.getFechaApertura(),
                pedido.getTipo(),
                pedido.getTotal(),
                pedido.getEstado(),
                idMesa,
                detallesDTO
        );
    }
}