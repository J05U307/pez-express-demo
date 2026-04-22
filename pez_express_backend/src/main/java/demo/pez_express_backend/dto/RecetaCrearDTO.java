package demo.pez_express_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class RecetaCrearDTO {
    private Long idProducto;
    private List<RecetaDetalleDTO> detalles;
}
