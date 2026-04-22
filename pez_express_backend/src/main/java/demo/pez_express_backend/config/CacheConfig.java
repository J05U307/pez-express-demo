package demo.pez_express_backend.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CacheConfig {

    // Nombres de todos los cachés del sistema — centraliza los nombres
    // para no escribirlos como strings sueltos en cada @Cacheable
    public static final String CACHE_PRODUCTOS     = "productos";
    public static final String CACHE_PRODUCTO      = "producto";
    public static final String CACHE_INSUMOS       = "insumos";
    public static final String CACHE_INSUMO        = "insumo";
    public static final String CACHE_RECETAS       = "recetas";
    public static final String CACHE_CONFIGURACION = "configuracion";

    @Bean
    public CacheManager cacheManager() {
        // ConcurrentMapCache: en memoria, sin dependencias extra.
        // Para múltiples instancias o TTL automático → reemplaza por Redis (paso 7).
        return new ConcurrentMapCacheManager(
                CACHE_PRODUCTOS,
                CACHE_PRODUCTO,
                CACHE_INSUMOS,
                CACHE_INSUMO,
                CACHE_RECETAS,
                CACHE_CONFIGURACION
        );
    }
}