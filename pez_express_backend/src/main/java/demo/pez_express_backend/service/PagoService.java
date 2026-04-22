package demo.pez_express_backend.service;

import demo.pez_express_backend.dto.PagoCrearDTO;
import demo.pez_express_backend.dto.PagoResponseDTO;
import demo.pez_express_backend.entity.Pago;

import java.time.LocalDate;
import java.util.List;

public interface PagoService {

    PagoResponseDTO crear (PagoCrearDTO pago);
    List<PagoResponseDTO> listar();

    List<PagoResponseDTO> listarPorDia(LocalDate fehca);

}
