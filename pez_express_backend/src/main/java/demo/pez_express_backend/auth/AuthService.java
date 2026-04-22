package demo.pez_express_backend.auth;

import demo.pez_express_backend.auth.dto.LoginRequest;
import demo.pez_express_backend.auth.dto.TokensResponse;
import demo.pez_express_backend.entity.RefreshToken;
import demo.pez_express_backend.entity.Usuario;
import demo.pez_express_backend.security.JwtService;
import demo.pez_express_backend.security.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    // UsuarioRepository y CustomUserDetailsService ya no hacen falta aquí
    // El usuario viene dentro del Authentication que devuelve authenticate()

    public TokensResponse login(LoginRequest request) {

        // authenticate() llama a loadUserByUsername() internamente — carga el usuario
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsuario(),
                        request.getPassword()
                )
        );

        // Reutilizar el principal ya cargado — sin segunda query a la BD
        Usuario usuario = (Usuario) auth.getPrincipal();

        String accessToken = jwtService.generateAccessToken(usuario);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(usuario);

        return new TokensResponse(accessToken, refreshToken.getToken());
    }

    public TokensResponse refreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(refreshTokenValue);
        Usuario usuario = refreshToken.getUsuario();

        refreshTokenService.revokeAllTokensForUser(usuario);
        RefreshToken nuevoRefreshToken = refreshTokenService.createRefreshToken(usuario);
        String nuevoAccessToken = jwtService.generateAccessToken(usuario);

        return new TokensResponse(nuevoAccessToken, nuevoRefreshToken.getToken());
    }

    public void logout(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(refreshTokenValue);
        refreshTokenService.revokeAllTokensForUser(refreshToken.getUsuario());
    }
}