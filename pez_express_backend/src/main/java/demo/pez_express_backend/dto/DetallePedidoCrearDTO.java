package demo.pez_express_backend.dto;

import lombok.Data;

@Data
public class DetallePedidoCrearDTO {

    private Long idProducto;
    private int cantidad;
    private String observacion;
}
