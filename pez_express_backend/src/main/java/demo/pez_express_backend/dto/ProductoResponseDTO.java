package demo.pez_express_backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.enums.TipoProducto;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductoResponseDTO {

    private Long idProducto;
    private String nombre;
    private String descripcion;
    private Double precio;
    private Estado estado;
    private Boolean manejoStock;
    private Boolean imprimeCocina;
    private TipoProducto tipoProducto;

    private Integer stockActual; // opcional
}
