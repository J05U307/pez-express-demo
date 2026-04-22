package demo.pez_express_backend.service;

import demo.pez_express_backend.dto.ConfiguracionDTO;

public interface ConfiguracionService {
    ConfiguracionDTO obtener();
    ConfiguracionDTO actualizar(ConfiguracionDTO dto);
}