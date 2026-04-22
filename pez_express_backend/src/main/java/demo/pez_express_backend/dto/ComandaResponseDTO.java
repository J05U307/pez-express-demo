package demo.pez_express_backend.dto;


//import demo.pez_express_backend.enums.EstadoComanda;
import demo.pez_express_backend.enums.TipoComanda;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ComandaResponseDTO {
    private Long idComanda;
    private Long idPedido;
    private Long idMesa;       // puede ser null si es LLEVAR
    private String nombreProducto;
    private int cantidad;
    private TipoComanda tipo;
    //private EstadoComanda estado;
    private LocalDateTime fechaHora;
    private String observacion;
}