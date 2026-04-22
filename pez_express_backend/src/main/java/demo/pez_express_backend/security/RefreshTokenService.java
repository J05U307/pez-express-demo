package demo.pez_express_backend.security;


import demo.pez_express_backend.entity.RefreshToken;
import demo.pez_express_backend.entity.Usuario;
import demo.pez_express_backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public RefreshToken createRefreshToken(Usuario usuario) {
        // Revocar tokens anteriores del usuario (solo 1 sesión activa)
        // Si querés múltiples sesiones (ej: móvil + web), eliminá esta línea
        //      refreshTokenRepository.revokeAllByUsuario(usuario);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .usuario(usuario)
                .expiresAt(Instant.now().plusMillis(refreshTokenExpiration))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token no encontrado"));

        if (refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh token revocado");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            // Revocar token expirado y lanzar error
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new RuntimeException("Refresh token expirado, por favor inicie sesión nuevamente");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeAllTokensForUser(Usuario usuario) {
        refreshTokenRepository.revokeAllByUsuario(usuario);
    }
}