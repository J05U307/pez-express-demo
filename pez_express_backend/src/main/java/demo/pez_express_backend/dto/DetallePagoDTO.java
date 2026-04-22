package demo.pez_express_backend.dto;

import demo.pez_express_backend.enums.MetodoPago;
import lombok.Data;

@Data
public class DetallePagoDTO {

    private MetodoPago metodoPago;
    private Double monto;
}
