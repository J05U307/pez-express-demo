package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.config.CacheConfig;
import demo.pez_express_backend.dto.ProductoCrearDTO;
import demo.pez_express_backend.dto.ProductoResponseDTO;
import demo.pez_express_backend.entity.Producto;
import demo.pez_express_backend.entity.StockProducto;
import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.enums.TipoProducto;
import demo.pez_express_backend.exception.BadRequestException;
import demo.pez_express_backend.exception.NotFoundException;
import demo.pez_express_backend.repository.ProductoRepositoy;
import demo.pez_express_backend.repository.StockProductoRepositoy;
import demo.pez_express_backend.service.ProductoService;
import jakarta.transaction.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepositoy productoRepositoy;
    private final StockProductoRepositoy stockProductoRepositoy;
    public ProductoServiceImpl(
            ProductoRepositoy productoRepositoy,
            StockProductoRepositoy stockProductoRepositoy
    ) {
        this.productoRepositoy = productoRepositoy;
        this.stockProductoRepositoy = stockProductoRepositoy;
    }

    // METODOOS
    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_PRODUCTOS,  allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_RECETAS,    allEntries = true)
    })
    public ProductoResponseDTO crear(ProductoCrearDTO dto) {

        if (dto.getTipoProducto() == null) {
            throw new BadRequestException("Debe enviar un tipo de producto válido.");
        }
        if (dto.getTipoProducto() == TipoProducto.PLATO && dto.getManejoStock()) {
            throw new BadRequestException("Los platos no deben manejar stock.");
        }

        Producto producto = new Producto();
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setManejoStock(dto.getManejoStock());
        producto.setImprimeCocina(dto.getImprimeCocina());
        producto.setTipoProducto(dto.getTipoProducto());
        producto.setEstado(Estado.ACTIVO);

        Producto productoGuardado = productoRepositoy.save(producto);

        if (productoGuardado.isManejoStock()) {

            if (dto.getStockActual() == null) {
                throw new BadRequestException("Debe enviar stockActual si manejoStock es true.");
            }

            StockProducto stock = new StockProducto();
            stock.setProducto(productoGuardado);
            stock.setStockActual(dto.getStockActual());
            stockProductoRepositoy.save(stock);
        }

        return mapToDTO(productoGuardado);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_PRODUCTOS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_PRODUCTO,  key = "#id"),
            @CacheEvict(value = CacheConfig.CACHE_RECETAS,   allEntries = true)
    })
    public ProductoResponseDTO actualizar(Long id, ProductoCrearDTO dto) {

        Producto producto = productoRepositoy.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado"));

        if (dto.getTipoProducto() == null) {
            throw new BadRequestException("Debe enviar un tipo de producto válido.");
        }

        if (dto.getTipoProducto() == TipoProducto.PLATO && dto.getManejoStock()) {
            throw new BadRequestException("Los platos no deben manejar stock.");
        }
        if (dto.getEstado() == null) {
            throw new BadRequestException("Debe enviar un tipo de Estado Valido ");
        }

        // Actualizar campos
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setTipoProducto(dto.getTipoProducto());
        producto.setImprimeCocina(dto.getImprimeCocina());
        producto.setEstado(dto.getEstado());

        Boolean manejoStockAnterior = producto.isManejoStock();
        Boolean manejoStockNuevo = dto.getManejoStock();
        producto.setManejoStock(manejoStockNuevo);

        Producto productoActualizado = productoRepositoy.save(producto);

        // CASO 1: antes no manejaba stock y ahora sí
        if (!manejoStockAnterior && manejoStockNuevo) {

            if (dto.getStockActual() == null) {
                throw new BadRequestException("Debe enviar stockActual si manejoStock es true.");
            }

            StockProducto stock = new StockProducto();
            stock.setProducto(productoActualizado);
            stock.setStockActual(dto.getStockActual());
            stockProductoRepositoy.save(stock);
        }

        // CASO 2: antes manejaba stock y ahora no
        if (manejoStockAnterior && !manejoStockNuevo) {
            stockProductoRepositoy.deleteByProducto(productoActualizado);
        }

        // CASO 3: sigue manejando stock
        if (manejoStockAnterior && manejoStockNuevo) {
            StockProducto stock = stockProductoRepositoy
                    .findByProducto(productoActualizado)
                    .orElseThrow(() -> new NotFoundException("Stock no encontrado"));

            if (dto.getStockActual() != null) {
                stock.setStockActual(dto.getStockActual());
                stockProductoRepositoy.save(stock);
            }
        }

        return mapToDTO(productoActualizado);
    }


    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_PRODUCTOS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_PRODUCTO,  key = "#id"),
            @CacheEvict(value = CacheConfig.CACHE_RECETAS,   allEntries = true)
    })
    public void eliminar(Long id) {
        productoRepositoy.deleteById(id);
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_PRODUCTOS)
    public List<ProductoResponseDTO> listar() {
        return productoRepositoy.findAll()
                .stream()
                .map(producto -> {
                    ProductoResponseDTO dto = new ProductoResponseDTO();
                    dto.setIdProducto(producto.getIdProducto());
                    dto.setNombre(producto.getNombre());
                    dto.setDescripcion(producto.getDescripcion());
                    dto.setPrecio(producto.getPrecio());
                    dto.setEstado(producto.getEstado());
                    dto.setManejoStock(producto.isManejoStock());
                    dto.setImprimeCocina(producto.isImprimeCocina());
                    dto.setTipoProducto(producto.getTipoProducto());
                    if (producto.isManejoStock() && producto.getStockProducto() != null)
                        dto.setStockActual(producto.getStockProducto().getStockActual());
                    return dto;
                })
                .toList();
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_PRODUCTO, key = "#id")
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepositoy.findById(id);
    }



    public List<ProductoResponseDTO> listarSinStock() {
        return listar().stream()
                .filter(dto -> !dto.getManejoStock())
                .toList();
    }


    private ProductoResponseDTO mapToDTO(Producto producto) {
        ProductoResponseDTO dto = new ProductoResponseDTO();
        dto.setIdProducto(producto.getIdProducto());
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecio(producto.getPrecio());
        dto.setEstado(producto.getEstado());
        dto.setManejoStock(producto.isManejoStock());
        dto.setImprimeCocina(producto.isImprimeCocina());
        dto.setTipoProducto(producto.getTipoProducto());
        if (producto.isManejoStock())
            stockProductoRepositoy.findByProducto(producto)
                    .ifPresent(stock -> dto.setStockActual(stock.getStockActual()));
        return dto;
    }
}
