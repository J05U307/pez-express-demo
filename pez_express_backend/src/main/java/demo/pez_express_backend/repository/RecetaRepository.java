package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecetaRepository extends JpaRepository<Receta, Long> {
    List<Receta> findByProductoIdProducto(Long idProducto);

    void deleteByProductoIdProducto(Long idProducto);

    boolean existsByProductoIdProducto(Long idProducto);

    @Query("""
            SELECT r FROM Receta r
            JOIN FETCH r.insumo
            WHERE r.producto.idProducto IN :ids
            """)
    List<Receta> findByProductoIdProductoIn(@Param("ids") List<Long> ids);
}
