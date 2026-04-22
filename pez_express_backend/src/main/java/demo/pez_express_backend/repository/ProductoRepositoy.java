package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepositoy extends JpaRepository<Producto, Long> {

    List<Producto> findByManejoStockFalse();
}
