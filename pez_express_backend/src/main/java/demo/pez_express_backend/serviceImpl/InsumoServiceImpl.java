package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.config.CacheConfig;
import demo.pez_express_backend.entity.Insumo;
import demo.pez_express_backend.exception.NotFoundException;
import demo.pez_express_backend.repository.InsumoRepository;
import demo.pez_express_backend.repository.UsuarioRepository;
import demo.pez_express_backend.service.InsumoService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InsumoServiceImpl implements InsumoService {

    private final InsumoRepository insumoRepository;
    private final UsuarioRepository usuarioRepository;

    public InsumoServiceImpl(InsumoRepository insumoRepository,
                             UsuarioRepository usuarioRepository) {
        this.insumoRepository = insumoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_INSUMOS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_RECETAS, allEntries = true)
    })
    public Insumo crear(Insumo insumo) {
        return insumoRepository.save(insumo);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_INSUMOS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_INSUMO,  key = "#id"),
            @CacheEvict(value = CacheConfig.CACHE_RECETAS, allEntries = true)
    })
    public Insumo actualizar(Long id, Insumo insumo) {
        Insumo existe = insumoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Insumo no encontrado"));

        existe.setNombre(insumo.getNombre());
        existe.setStockActual(insumo.getStockActual());
        existe.setUnidadMedida(insumo.getUnidadMedida());
        existe.setEstado(insumo.getEstado());

        return insumoRepository.save(existe);
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_INSUMOS)
    public List<Insumo> listar() {
        return insumoRepository.findAll();
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_INSUMO, key = "#id")
    public Optional<Insumo> listarPorIdI(Long id) {
        return insumoRepository.findById(id);
    }
}