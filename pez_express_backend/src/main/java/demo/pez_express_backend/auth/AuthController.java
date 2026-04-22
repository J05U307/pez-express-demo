package demo.pez_express_backend.auth;

import demo.pez_express_backend.auth.dto.LoginRequest;
import demo.pez_express_backend.auth.dto.TokensResponse;
import demo.pez_express_backend.dto.UserMeResponse;
import demo.pez_express_backend.entity.Usuario;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    //private boolean valorsecure = false; // falso proque vamos a probar en celular || en produccion cambiar a true, ya que se va usar https

    private boolean valorsecure = Boolean.parseBoolean(
            System.getenv().getOrDefault("SECURE_COOKIES", "false")
    );

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {

        TokensResponse tokens = authService.login(request);
        setTokenCookies(response, tokens);

        return ResponseEntity.ok(Map.of(
                "message", "Login exitoso"
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshToken = extractCookieValue(request, "refresh_token");

        if (refreshToken == null) {
            return ResponseEntity.status(401).body("Refresh token no encontrado");
        }

        TokensResponse tokens = authService.refreshToken(refreshToken);
        setTokenCookies(response, tokens);

        return ResponseEntity.ok().body("Token renovado");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshToken = extractCookieValue(request, "refresh_token");

        if (refreshToken != null) {
            try {
                authService.logout(refreshToken);
            } catch (Exception ignored) {
                // Si el token ya era inválido, igual limpiamos las cookies
            }
        }

        // Limpiar ambas cookies
        clearCookie(response, "jwt");
        clearCookie(response, "refresh_token");

        return ResponseEntity.ok().body("Sesión cerrada correctamente");
    }
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("No autenticado");
        }

        Usuario usuario = (Usuario) authentication.getPrincipal();

        UserMeResponse response = new UserMeResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getUsuario(),
                usuario.getDni(),
                usuario.getRol().getNombre(),
                usuario.isPasswordTemporal()
        );

        return ResponseEntity.ok(response);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private void setTokenCookies(HttpServletResponse response, TokensResponse tokens) {
        ResponseCookie accessCookie = ResponseCookie.from("jwt", tokens.getAccessToken())
                .httpOnly(true)
                .secure(valorsecure)           // HTTPS en producción
                .path("/")
                .maxAge(Duration.ofMinutes(15))
                .sameSite("Strict")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(valorsecure)           // HTTPS en producción
                .path("/api/auth")      // Solo se envía a endpoints de auth (más seguro)
                .maxAge(Duration.ofDays(7))
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private void clearCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(valorsecure)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}