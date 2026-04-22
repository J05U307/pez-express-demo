package demo.pez_express_backend.service;

import demo.pez_express_backend.dto.ProductoRecetaResponseDTO;
import demo.pez_express_backend.dto.RecetaCrearDTO;
import demo.pez_express_backend.dto.RecetaResponseDTO;
import demo.pez_express_backend.entity.Receta;
import org.hibernate.dialect.function.array.OracleArrayIncludesFunction;

import java.util.List;
import java.util.Optional;

public interface RecetaService {

    void crear(RecetaCrearDTO receta);
    void actualizar (RecetaCrearDTO receta);
    List<ProductoRecetaResponseDTO> listar();
    Optional<Receta> listarPorId(Long id);

    ProductoRecetaResponseDTO listarPorProducto(Long idProducto);
}
