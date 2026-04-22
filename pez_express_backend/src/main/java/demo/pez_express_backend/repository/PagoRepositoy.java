package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PagoRepositoy extends JpaRepository<Pago, Long> {

    List<Pago> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

}
