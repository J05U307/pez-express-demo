package demo.pez_express_backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PagoResponseDTO {

    private Long idPago;
    private Long idPedido;
    private Double total;
    private LocalDateTime fechaHora;
    private Long idUsuarioCobro;
    private String nombreUsuarioCobro;
    private List<DetallePagoDTO>  detallePago;
}
