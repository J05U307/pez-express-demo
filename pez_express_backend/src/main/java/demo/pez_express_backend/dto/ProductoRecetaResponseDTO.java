package demo.pez_express_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProductoRecetaResponseDTO {

    private Long idProducto;
    private String nombreProducto;
    private List<RecetaResponseDTO> receta;

}