package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.entity.Mesa;
import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.enums.EstadoMesa;
import demo.pez_express_backend.exception.NotFoundException;
import demo.pez_express_backend.repository.MesaRepository;
import demo.pez_express_backend.service.MesaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MesServiceImpl implements MesaService {

    private final MesaRepository mesaRepository;
    public MesServiceImpl(MesaRepository mesaRepository) {
        this.mesaRepository = mesaRepository;
    }

    @Override
    public Mesa crear() {

        Long ultimoNumero = mesaRepository.findMaxNumeroMesa();
        Long nuevoNumero = (ultimoNumero == null) ? 1 : ultimoNumero + 1;

        Mesa mesa = new Mesa();
        mesa.setNumeroMesa(nuevoNumero);
        mesa.setDisponibilidadEstado(EstadoMesa.LIBRE);
        mesa.setEstado(Estado.ACTIVO);

        return mesaRepository.save(mesa);

    }

    @Override
    public Mesa actualizar(Long id, Mesa mesa) {
        Mesa existe = mesaRepository.findById(id).orElseThrow(() ->new NotFoundException("No se encontro la mesa"));

        existe.setNumeroMesa(mesa.getNumeroMesa());
        existe.setEstado(mesa.getEstado());

        return mesaRepository.save(existe);
    }

    @Override
    public void eliminar(Long id) {
        mesaRepository.deleteById(id);
    }

    @Override
    public Optional<Mesa> listarPorId(Long id) {
        return mesaRepository.findById(id);
    }

    @Override
    public List<Mesa> listar() {
        return mesaRepository.findAll();
    }

    @Override
    public Mesa actualizarDiposponibilidaEstado(Long id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Mesa no encontrada"));

        mesa.setDisponibilidadEstado(
                mesa.getDisponibilidadEstado() == EstadoMesa.LIBRE
                        ? EstadoMesa.OCUPADO
                        : EstadoMesa.LIBRE
        );

        return mesaRepository.save(mesa);
    }

}
