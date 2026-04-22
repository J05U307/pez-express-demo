package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsuario(String usuario);


    Optional<Usuario> findByDni(String dni);

    boolean existsByUsuario(String usuario);

    boolean existsByDni(String dni);


    // UsuarioRepository.java
    @Query("SELECT u FROM Usuario u JOIN FETCH u.rol WHERE u.usuario = :usuario")
    Optional<Usuario> findByUsuarioConRol(@Param("usuario") String usuario);
}