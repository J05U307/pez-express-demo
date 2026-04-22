package demo.pez_express_backend.dto;

import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.enums.TipoProducto;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoCrearDTO {

    private String nombre;
    private String descripcion;
    private Double precio;
    private Boolean manejoStock;
    private Boolean imprimeCocina;
    private TipoProducto tipoProducto;

    private Integer stockActual; // opcional
    private Estado estado; // para actualizar
}
