package demo.pez_express_backend.dto;

import demo.pez_express_backend.enums.EstadoPedido;
import demo.pez_express_backend.enums.TipoPedido;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
public class PedidoResponseDTO {

    private Long idPedido;
    private LocalDateTime fechaApertura;
    private TipoPedido tipoPedido;
    private Double total;
    private EstadoPedido estadoPedido;
    private Long idMesa; // Este en algunso casos a hacer null

    private List<DetallePedidoResponseDTO> detalles;


}
