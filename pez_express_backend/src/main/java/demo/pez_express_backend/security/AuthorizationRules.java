package demo.pez_express_backend.security;


import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.stereotype.Component;

import static demo.pez_express_backend.security.Roles.*;

@Component
public class AuthorizationRules {

    /**
     * Define aquí todas las reglas de acceso.
     * Cuando agregues un nuevo rol o endpoint, solo tocas este archivo.
     */
    public void apply(
            AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth
    ) {
        auth
                // ── Públicos ─────────────────────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/ws/**").permitAll()

                // ── Mesas ─────────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,    "/api/mesas/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.POST,   "/api/mesas/**").hasAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PUT,    "/api/mesas/**").hasAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.DELETE, "/api/mesas/**").hasAuthority(ADMINISTRADOR)

                // ── INSUMOS ─────────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,    "/api/insumos/**").hasAnyAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PUT,    "/api/insumos/**").hasAnyAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.POST,    "/api/insumos/**").hasAnyAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PATCH,    "/api/insumos/**").hasAnyAuthority(ADMINISTRADOR)

                // ── RECETAS ─────────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,    "/api/recetas/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.POST,    "/api/recetas/**").hasAnyAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PUT,    "/api/recetas/**").hasAnyAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PATCH,    "/api/recetas/**").hasAnyAuthority(ADMINISTRADOR)



                // ── Pedidos ───────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,    "/api/pedidos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.POST,   "/api/pedidos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.PUT,    "/api/pedidos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.DELETE, "/api/pedidos/**").hasAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PATCH, "/api/pedidos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)


                // ── PAGOS ───────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,    "/api/pagos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.POST,    "/api/pagos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.PATCH,    "/api/pagos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.PUT,    "/api/pagos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)


                // ── Comandas ───────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,    "/api/cocina/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.PATCH,   "/api/cocina/**").hasAnyAuthority(ADMINISTRADOR, MESERO)


                // ── Usuarios ──────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/usuarios/**").hasAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.POST    , "/api/usuarios/**").hasAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PATCH,   "/api/usuarios/**").hasAnyAuthority(ADMINISTRADOR, MESERO)

                // ── Productos ─────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,    "/api/productos/**").hasAnyAuthority(ADMINISTRADOR, MESERO)
                .requestMatchers(HttpMethod.POST,   "/api/productos/**").hasAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PUT,    "/api/productos/**").hasAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasAuthority(ADMINISTRADOR)
                .requestMatchers(HttpMethod.PATCH, "/api/productos/**").hasAuthority(ADMINISTRADOR)

                // ── Resto autenticado ─────────────────────────────────────────────
                .anyRequest().authenticated();
    }
}