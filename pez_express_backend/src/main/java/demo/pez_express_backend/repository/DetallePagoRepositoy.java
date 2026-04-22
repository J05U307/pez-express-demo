package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.DetallePago;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetallePagoRepositoy extends JpaRepository<DetallePago, Long> {
}
