package demo.pez_express_backend.repository;

import demo.pez_express_backend.entity.RefreshToken;
import demo.pez_express_backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    //Optional<RefreshToken> findByToken(String token);

    // Revocar todos los tokens de un usuario (útil en logout y cambio de contraseña)
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.usuario = :usuario")
    void revokeAllByUsuario(Usuario usuario);



    @Query("""
            SELECT rt FROM RefreshToken rt
            JOIN FETCH rt.usuario u
            JOIN FETCH u.rol
            WHERE rt.token = :token
            """)
    Optional<RefreshToken> findByToken(@Param("token") String token);

}