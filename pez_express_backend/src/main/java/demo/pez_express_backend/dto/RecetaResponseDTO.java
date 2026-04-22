package demo.pez_express_backend.dto;

import lombok.Data;

@Data
public class RecetaResponseDTO {
    private Long IdInsumo;
    private String nombreInsumo;
    private int cantidadUsada;
    private String unidadMedida;
}
