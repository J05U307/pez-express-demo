package demo.pez_express_backend.dto;

import demo.pez_express_backend.entity.DetallePedido;
import demo.pez_express_backend.enums.TipoPedido;
import lombok.Data;

import java.util.List;

@Data
public class PedidoCrearDTO {

    private Long idMesa;
    private Long idMesero;
    private TipoPedido tipoPedido;
    private Long idCliente; // PUede ser null

    private List<DetallePedidoCrearDTO> detalles;

}
