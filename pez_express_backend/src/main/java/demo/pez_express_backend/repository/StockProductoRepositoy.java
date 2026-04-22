package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.Producto;
import demo.pez_express_backend.entity.StockProducto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockProductoRepositoy extends JpaRepository<StockProducto, Long> {

    Optional<StockProducto> findByProducto(Producto producto);
    void deleteByProducto(Producto producto);
}
