package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.entity.Rol;
import demo.pez_express_backend.repository.RolRepository;
import demo.pez_express_backend.service.RolService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RolServiceImpl implements RolService {

    private final RolRepository rolRepository;
    public RolServiceImpl(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }


    @Override
    public Rol crear(Rol rol) {
        return rolRepository.save(rol);
    }

    @Override
    public Rol actualizar(Rol rol) {
        return rolRepository.save(rol);
    }

    @Override
    public void eliminar(Long id) {
        rolRepository.deleteById(id);
    }

    @Override
    public List<Rol> listar() {
        return rolRepository.findAll();
    }

    @Override
    public Optional<Rol> listarPorId(Long id) {
        return rolRepository.findById(id);
    }
}
