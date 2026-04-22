package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.config.CacheConfig;
import demo.pez_express_backend.dto.ConfiguracionDTO;
import demo.pez_express_backend.entity.Configuracion;
import demo.pez_express_backend.repository.ConfiguracionRepository;
import demo.pez_express_backend.service.ConfiguracionService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConfiguracionServiceImpl implements ConfiguracionService {

    private final ConfiguracionRepository repo;

    public ConfiguracionServiceImpl(ConfiguracionRepository repo) {
        this.repo = repo;
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_CONFIGURACION, key = "'global'")
    public ConfiguracionDTO obtener() {
        Configuracion c = repo.findById(1L).orElseGet(() -> {
            Configuracion nueva = new Configuracion();
            nueva.setId(1L);
            nueva.setHoraInicio(java.time.LocalTime.of(8, 0));
            nueva.setHoraFin(java.time.LocalTime.of(22, 0));
            nueva.setQrYapeUrl(null);
            nueva.setDiasAtencion("LUNES,MARTES,MIERCOLES,JUEVES,VIERNES,SABADO,DOMINGO");
            return nueva;
        });
        return toDTO(c);
    }

    @Override
    @CacheEvict(value = CacheConfig.CACHE_CONFIGURACION, allEntries = true)
    public ConfiguracionDTO actualizar(ConfiguracionDTO dto) {
        Configuracion c = repo.findById(1L).orElse(new Configuracion());
        c.setId(1L);
        c.setHoraInicio(dto.getHoraInicio());
        c.setHoraFin(dto.getHoraFin());
        c.setQrYapeUrl(dto.getQrYapeUrl());
        c.setDiasAtencion(
                dto.getDiasAtencion() != null
                        ? String.join(",", dto.getDiasAtencion())
                        : ""
        );
        repo.save(c);
        return toDTO(c);
    }

    private ConfiguracionDTO toDTO(Configuracion c) {
        List<String> dias = (c.getDiasAtencion() != null && !c.getDiasAtencion().isBlank())
                ? List.of(c.getDiasAtencion().split(","))
                : List.of();
        return new ConfiguracionDTO(c.getHoraInicio(), c.getHoraFin(), c.getQrYapeUrl(), dias);
    }
}