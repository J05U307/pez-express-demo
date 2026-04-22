package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.dto.ProductoRecetaResponseDTO;
import demo.pez_express_backend.dto.RecetaCrearDTO;
import demo.pez_express_backend.dto.RecetaDetalleDTO;
import demo.pez_express_backend.dto.RecetaResponseDTO;
import demo.pez_express_backend.entity.Insumo;
import demo.pez_express_backend.entity.Producto;
import demo.pez_express_backend.entity.Receta;
import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.exception.NotFoundException;
import demo.pez_express_backend.repository.InsumoRepository;
import demo.pez_express_backend.repository.ProductoRepositoy;
import demo.pez_express_backend.repository.RecetaRepository;
import demo.pez_express_backend.service.RecetaService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecetaServiceImpl implements RecetaService {
    private final RecetaRepository recetaRepository;
    private final ProductoRepositoy productoRepositoy;
    private final InsumoRepository insumoRepository;

    public RecetaServiceImpl(RecetaRepository recetaRepository, ProductoRepositoy productoRepositoy, InsumoRepository insumoRepository) {
        this.recetaRepository = recetaRepository;
        this.productoRepositoy = productoRepositoy;
        this.insumoRepository = insumoRepository;
    }

    @Transactional
    public void crear(RecetaCrearDTO dto) {

        Producto producto = productoRepositoy.findById(dto.getIdProducto())
                .orElseThrow(() -> new NotFoundException("Producto no encontrado"));

        if (producto.isManejoStock()) {
            throw new IllegalStateException("No se puede crear receta para productos sin manejo de stock");
        }

        if (recetaRepository.existsByProductoIdProducto(dto.getIdProducto())) {
            throw new IllegalStateException("El producto ya tiene receta");
        }

        if (dto.getDetalles() == null || dto.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("La receta debe tener al menos un insumo");
        }

        Set<Long> insumosUsados = new HashSet<>();

        for (RecetaDetalleDTO detalle : dto.getDetalles()) {

            if (detalle.getCantidadUsada() <= 0) {
                throw new IllegalArgumentException("La cantidad usada debe ser mayor a 0");
            }

            if (!insumosUsados.add(detalle.getIdInsumo())) {
                throw new IllegalStateException("El insumo está repetido en la receta");
            }

            Insumo insumo = insumoRepository.findById(detalle.getIdInsumo())
                    .orElseThrow(() -> new NotFoundException("Insumo no encontrado"));

            if (insumo.getEstado() != Estado.ACTIVO) {
                throw new IllegalStateException("El insumo " + insumo.getNombre() + " no está activo");
            }

            Receta receta = new Receta();
            receta.setProducto(producto);
            receta.setInsumo(insumo);
            receta.setCantidadUsada(detalle.getCantidadUsada());

            recetaRepository.save(receta);
        }
    }

    @Override
    @Transactional
    public void actualizar(RecetaCrearDTO dto) {

        Producto producto = productoRepositoy.findById(dto.getIdProducto())
                .orElseThrow(() -> new NotFoundException("Producto no encontrado"));


        if (producto.isManejoStock()) {
            throw new IllegalStateException("No se puede crear receta para productos sin manejo de stock");
        }

        Set<Long> insumosIds = new HashSet<>();
        for (RecetaDetalleDTO detalle : dto.getDetalles()) {
            if (!insumosIds.add(detalle.getIdInsumo())) {
                throw new IllegalStateException("El insumo está duplicado en la receta");
            }
        }

        List<Insumo> insumosValidados = new ArrayList<>();

        for (RecetaDetalleDTO detalle : dto.getDetalles()) {

            if (detalle.getCantidadUsada() <= 0) {
                throw new IllegalStateException("La cantidad usada debe ser mayor a 0");
            }

            Insumo insumo = insumoRepository.findById(detalle.getIdInsumo())
                    .orElseThrow(() -> new NotFoundException("Insumo no encontrado"));

            if (insumo.getEstado() != Estado.ACTIVO) {
                throw new IllegalStateException("El insumo " + insumo.getNombre() + " no está activo");
            }

            insumosValidados.add(insumo);
        }


        recetaRepository.deleteByProductoIdProducto(dto.getIdProducto());

        // Insertar nueva receta
        for (int i = 0; i < dto.getDetalles().size(); i++) {

            RecetaDetalleDTO detalle = dto.getDetalles().get(i);
            Insumo insumo = insumosValidados.get(i);

            Receta receta = new Receta();
            receta.setProducto(producto);
            receta.setInsumo(insumo);
            receta.setCantidadUsada(detalle.getCantidadUsada());

            recetaRepository.save(receta);
        }
    }

    @Override
    public List<ProductoRecetaResponseDTO> listar() {
        List<Receta> recetas = recetaRepository.findAll();

        Map<Long, List<Receta>> recetasPorProducto =
                recetas.stream().collect(Collectors.groupingBy(r -> r.getProducto().getIdProducto()));

        List<ProductoRecetaResponseDTO> resultado = new ArrayList<>();

        for (Map.Entry<Long, List<Receta>> entry : recetasPorProducto.entrySet()) {

            List<Receta> recetasProducto = entry.getValue();
            Receta primera = recetasProducto.get(0);

            ProductoRecetaResponseDTO dto = new ProductoRecetaResponseDTO();
            dto.setIdProducto(primera.getProducto().getIdProducto());
            dto.setNombreProducto(primera.getProducto().getNombre());

            List<RecetaResponseDTO> recetaDTO = recetasProducto.stream().map(r -> {
                RecetaResponseDTO insumo = new RecetaResponseDTO();
                insumo.setIdInsumo(r.getInsumo().getIdInsumo());
                insumo.setNombreInsumo(r.getInsumo().getNombre());
                insumo.setCantidadUsada(r.getCantidadUsada());
                insumo.setUnidadMedida(r.getInsumo().getUnidadMedida().name());
                return insumo;
            }).toList();

            dto.setReceta(recetaDTO);

            resultado.add(dto);
        }

        return resultado;
    }

    @Override
    public Optional<Receta> listarPorId(Long id) {
        return recetaRepository.findById(id);
    }

    @Override
    public ProductoRecetaResponseDTO listarPorProducto(Long idProducto) {


        Producto producto = productoRepositoy.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado"));


        List<Receta> recetas = recetaRepository.findByProductoIdProducto(idProducto);
        ProductoRecetaResponseDTO response = new ProductoRecetaResponseDTO();
        response.setIdProducto(producto.getIdProducto());
        response.setNombreProducto(producto.getNombre());


        List<RecetaResponseDTO> recetaDTO = recetas.stream().map(r -> {
            RecetaResponseDTO dto = new RecetaResponseDTO();
            dto.setIdInsumo(r.getInsumo().getIdInsumo());
            dto.setNombreInsumo(r.getInsumo().getNombre());
            dto.setCantidadUsada(r.getCantidadUsada());
            dto.setUnidadMedida(r.getInsumo().getUnidadMedida().name());
            return dto;
        }).toList();

        response.setReceta(recetaDTO);

        return response;
    }

}

