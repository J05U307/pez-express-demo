package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.ComandaCocina;
//import demo.pez_express_backend.enums.EstadoComanda;
import demo.pez_express_backend.enums.EstadoPedido;
import demo.pez_express_backend.enums.TipoComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComandaCocinaRepository extends JpaRepository<ComandaCocina, Long> {


    List<ComandaCocina> findByPedidoEstadoAndTipoInOrderByFechaHoraAsc(
            EstadoPedido estadoPedido,
            List<TipoComanda> tipos
    );



    @Query("""
        SELECT c FROM ComandaCocina c
        WHERE c.pedido.idPedido = :idPedido
        AND c.producto.idProducto = :idProducto
        AND c.tipo = 'NUEVO'
        ORDER BY c.fechaHora DESC
        """)
    List<ComandaCocina> findNuevosByPedidoAndProducto(
            @Param("idPedido") Long idPedido,
            @Param("idProducto") Long idProducto
    );

}

