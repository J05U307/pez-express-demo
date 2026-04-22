package demo.pez_express_backend.service;

import demo.pez_express_backend.dto.ProductoCrearDTO;
import demo.pez_express_backend.dto.ProductoResponseDTO;
import demo.pez_express_backend.entity.Producto;

import java.util.List;
import java.util.Optional;

public interface ProductoService {
    ProductoResponseDTO crear(ProductoCrearDTO dto);
    ProductoResponseDTO actualizar(Long id, ProductoCrearDTO dto);
    void eliminar(Long id);
    List<ProductoResponseDTO> listar();
    Optional<Producto> buscarPorId(Long id);

    List<ProductoResponseDTO> listarSinStock();
}
