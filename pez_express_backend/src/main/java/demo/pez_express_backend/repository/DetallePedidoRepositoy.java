package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetallePedidoRepositoy extends JpaRepository<DetallePedido, Long> {
}
