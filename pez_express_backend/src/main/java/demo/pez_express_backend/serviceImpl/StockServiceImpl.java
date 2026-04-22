package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.config.CacheConfig;
import demo.pez_express_backend.dto.DetallePedidoCrearDTO;
import demo.pez_express_backend.entity.Insumo;
import demo.pez_express_backend.entity.Producto;
import demo.pez_express_backend.entity.Receta;
import demo.pez_express_backend.entity.StockProducto;
import demo.pez_express_backend.exception.BadRequestException;
import demo.pez_express_backend.exception.NotFoundException;
import demo.pez_express_backend.repository.ProductoRepositoy;
import demo.pez_express_backend.repository.RecetaRepository;
import demo.pez_express_backend.service.StockService;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StockServiceImpl implements StockService {

    private final ProductoRepositoy productoRepository;
    private final RecetaRepository recetaRepository;
    private final CacheManager cacheManager;

    public StockServiceImpl(ProductoRepositoy productoRepository,
                            RecetaRepository recetaRepository,
                            CacheManager cacheManager) {
        this.productoRepository = productoRepository;
        this.recetaRepository   = recetaRepository;
        this.cacheManager       = cacheManager;
    }

    // ─────────────────────────────────────────────────────────────────
    // NUEVO: validar stock en batch — 2 queries totales, sin importar
    // cuántos productos tenga el pedido
    // ─────────────────────────────────────────────────────────────────
    @Override
    public void validarStockPedido(List<DetallePedidoCrearDTO> detalles) {

        // ── Query 1: todos los productos del pedido de una vez ──────
        List<Long> ids = detalles.stream()
                .map(DetallePedidoCrearDTO::getIdProducto)
                .toList();

        Map<Long, Producto> productos = productoRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(Producto::getIdProducto, p -> p));

        // Verificar que todos los productos existen
        for (Long id : ids) {
            if (!productos.containsKey(id))
                throw new NotFoundException("Producto no encontrado: " + id);
        }

        // ── Query 2: recetas de todos los productos sin stock ────────
        // Solo se ejecuta si hay al menos un producto sin manejo de stock
        List<Long> idsSinStock = productos.values().stream()
                .filter(p -> !p.isManejoStock())
                .map(Producto::getIdProducto)
                .toList();

        // JOIN FETCH insumo incluido — sin queries adicionales al iterar
        Map<Long, List<Receta>> recetasPorProducto = idsSinStock.isEmpty()
                ? Map.of()
                : recetaRepository.findByProductoIdProductoIn(idsSinStock)
                .stream()
                .collect(Collectors.groupingBy(
                        r -> r.getProducto().getIdProducto()
                ));

        // ── Validación en memoria — sin más roundtrips a la BD ───────
        for (DetallePedidoCrearDTO dto : detalles) {
            Producto producto = productos.get(dto.getIdProducto());

            if (producto.isManejoStock()) {
                // Producto con stock directo
                int stockActual = producto.getStockProducto().getStockActual();
                if (stockActual < dto.getCantidad()) {
                    throw new BadRequestException(
                            "Stock insuficiente para " + producto.getNombre()
                                    + " | stock actual: " + stockActual
                    );
                }
            } else {
                // Producto con receta (platos)
                List<Receta> recetas = recetasPorProducto
                        .getOrDefault(dto.getIdProducto(), List.of());

                if (recetas.isEmpty()) {
                    throw new BadRequestException(
                            "El producto " + producto.getNombre()
                                    + " no tiene receta configurada."
                    );
                }

                for (Receta receta : recetas) {
                    int necesario = receta.getCantidadUsada() * dto.getCantidad();
                    int stockInsumo = receta.getInsumo().getStockActual();
                    if (stockInsumo < necesario) {
                        throw new BadRequestException(
                                "Insumo insuficiente: " + receta.getInsumo().getNombre()
                                        + " | stock actual: " + stockInsumo
                                        + " | necesario: " + necesario
                        );
                    }
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // NUEVO: descontar stock de todo el pedido en batch
    // Úsalo en PedidoServiceImpl.crear() en lugar del loop actual
    // ─────────────────────────────────────────────────────────────────
    @Override
    public void descontarStockPedidoBatch(List<DetallePedidoCrearDTO> detalles) {

        // ── Query 1: todos los productos ─────────────────────────────
        List<Long> ids = detalles.stream()
                .map(DetallePedidoCrearDTO::getIdProducto)
                .toList();

        Map<Long, Producto> productos = productoRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(Producto::getIdProducto, p -> p));

        // ── Query 2: recetas necesarias (con insumo en el mismo fetch) ──
        List<Long> idsSinStock = productos.values().stream()
                .filter(p -> !p.isManejoStock())
                .map(Producto::getIdProducto)
                .toList();

        Map<Long, List<Receta>> recetasPorProducto = idsSinStock.isEmpty()
                ? Map.of()
                : recetaRepository.findByProductoIdProductoIn(idsSinStock)
                .stream()
                .collect(Collectors.groupingBy(
                        r -> r.getProducto().getIdProducto()
                ));

        // ── Descontar en memoria — JPA detecta los cambios y hace
        //    UPDATE en batch al cerrar la transacción ─────────────────
        for (DetallePedidoCrearDTO dto : detalles) {
            Producto producto = productos.get(dto.getIdProducto());
            if (producto == null)
                throw new NotFoundException("Producto no encontrado: " + dto.getIdProducto());

            if (producto.isManejoStock()) {
                StockProducto stock = producto.getStockProducto();
                int nuevo = stock.getStockActual() - dto.getCantidad();
                if (nuevo < 0) throw new BadRequestException(
                        "Stock insuficiente para " + producto.getNombre()
                );
                stock.setStockActual(nuevo);

            } else {
                List<Receta> recetas = recetasPorProducto
                        .getOrDefault(dto.getIdProducto(), List.of());

                for (Receta receta : recetas) {
                    Insumo insumo = receta.getInsumo();
                    int descuento = receta.getCantidadUsada() * dto.getCantidad();
                    insumo.setStockActual(insumo.getStockActual() - descuento);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Métodos existentes — sin cambios, los usa PedidoServiceImpl
    // ítem a ítem cuando ya tiene el Producto cargado en memoria
    // ─────────────────────────────────────────────────────────────────
    @Override
    public void descontarStockPedido(List<DetallePedidoCrearDTO> detalles) {
        for (DetallePedidoCrearDTO detalleDTO : detalles) {
            Producto producto = productoRepository.findById(detalleDTO.getIdProducto())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado"));

            if (producto.isManejoStock()) {
                StockProducto stock = producto.getStockProducto();
                stock.setStockActual(stock.getStockActual() - detalleDTO.getCantidad());
            } else {
                List<Receta> recetas =
                        recetaRepository.findByProductoIdProducto(producto.getIdProducto());
                for (Receta receta : recetas) {
                    int cantidadNecesaria = receta.getCantidadUsada() * detalleDTO.getCantidad();
                    Insumo insumo = receta.getInsumo();
                    insumo.setStockActual(insumo.getStockActual() - cantidadNecesaria);
                }
            }
        }
    }

    @Override
    public void descontarStockProducto(Producto producto, int cantidad) {
        if (producto.isManejoStock()) {
            StockProducto stock = producto.getStockProducto();
            if (stock.getStockActual() < cantidad) {
                throw new BadRequestException(
                        "Stock insuficiente para " + producto.getNombre()
                                + " | stock actual: " + stock.getStockActual()
                );
            }
            stock.setStockActual(stock.getStockActual() - cantidad);
        } else {
            List<Receta> recetas =
                    recetaRepository.findByProductoIdProducto(producto.getIdProducto());

            if (recetas.isEmpty()) {
                throw new BadRequestException(
                        "El producto " + producto.getNombre() + " no tiene receta configurada."
                );
            }

            for (Receta receta : recetas) {
                int cantidadNecesaria = receta.getCantidadUsada() * cantidad;
                if (receta.getInsumo().getStockActual() < cantidadNecesaria) {
                    throw new BadRequestException(
                            "Insumo insuficiente: " + receta.getInsumo().getNombre()
                                    + " | stock actual: " + receta.getInsumo().getStockActual()
                    );
                }
            }

            for (Receta receta : recetas) {
                int cantidadNecesaria = receta.getCantidadUsada() * cantidad;
                receta.getInsumo().setStockActual(
                        receta.getInsumo().getStockActual() - cantidadNecesaria
                );
            }
        }

        invalidarCachesStock();
    }

    @Override
    public void devolverStockProducto(Producto producto, int cantidad) {
        if (producto.isManejoStock()) {
            StockProducto stock = producto.getStockProducto();
            stock.setStockActual(stock.getStockActual() + cantidad);
        } else {
            List<Receta> recetas =
                    recetaRepository.findByProductoIdProducto(producto.getIdProducto());
            for (Receta receta : recetas) {
                int devolver = receta.getCantidadUsada() * cantidad;
                receta.getInsumo().setStockActual(
                        receta.getInsumo().getStockActual() + devolver
                );
            }
        }
        invalidarCachesStock();
    }

    private void invalidarCachesStock() {
        var cacheProd    = cacheManager.getCache(CacheConfig.CACHE_PRODUCTOS);
        var cacheInsumos = cacheManager.getCache(CacheConfig.CACHE_INSUMOS);
        if (cacheProd    != null) cacheProd.clear();
        if (cacheInsumos != null) cacheInsumos.clear();
    }
}