package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InsumoRepository extends JpaRepository<Insumo, Long> {

}

