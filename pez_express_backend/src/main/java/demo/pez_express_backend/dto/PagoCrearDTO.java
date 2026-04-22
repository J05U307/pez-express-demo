package demo.pez_express_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class PagoCrearDTO {

    private Long idPedido;
    private Long idUsuarioCobro;

    private List<DetallePagoDTO> detallePagos;

}
