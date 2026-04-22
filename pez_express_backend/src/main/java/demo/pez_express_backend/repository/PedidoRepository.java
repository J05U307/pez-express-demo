package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("""
                SELECT DISTINCT p FROM Pedido p
                LEFT JOIN FETCH p.detallePedidos d
                LEFT JOIN FETCH d.producto
                WHERE p.idPedido = :id
            """)
    Optional<Pedido> findByIdConDetalles(@Param("id") Long id);

    @Query("""
                SELECT DISTINCT p FROM Pedido p
                LEFT JOIN FETCH p.detallePedidos d
                LEFT JOIN FETCH d.producto
                WHERE p.estado = 'ABIERTO'
                AND CAST(p.fechaApertura AS date) = CURRENT_DATE
            """)
    List<Pedido> findAbiertosHoy();


    @Query("""
            SELECT DISTINCT p FROM Pedido p
            LEFT JOIN FETCH p.detallePedidos d
            LEFT JOIN FETCH d.producto
            WHERE CAST(p.fechaApertura AS date) = :fecha
        """)
    List<Pedido> findByFecha(@Param("fecha") LocalDate fecha);





}

