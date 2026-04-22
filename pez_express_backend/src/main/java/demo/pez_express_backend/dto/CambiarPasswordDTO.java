package demo.pez_express_backend.dto;

import lombok.Data;

@Data
public class CambiarPasswordDTO {
    private Long idUsuario;
    private String passwordActual;
    private String passwordNuevo;

}