package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MesaRepository extends JpaRepository<Mesa, Long> {

    @Query("SELECT MAX(m.numeroMesa) FROM Mesa m")
    Long findMaxNumeroMesa();
}
