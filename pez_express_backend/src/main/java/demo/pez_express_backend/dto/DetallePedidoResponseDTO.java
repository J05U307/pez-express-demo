package demo.pez_express_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DetallePedidoResponseDTO {

    private String nombreProducto;
    private int cantidad;
    private Double precioUnitario;
    private Double subtotal;
    private String observacion;



}
