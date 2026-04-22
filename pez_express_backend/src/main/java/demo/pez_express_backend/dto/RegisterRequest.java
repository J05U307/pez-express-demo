package demo.pez_express_backend.dto;

import demo.pez_express_backend.enums.Estado;
import lombok.Data;

@Data
public class RegisterRequest {
    private String nombre;
    private String apellido;
    private String celular;
    private String dni;

    private String usuario;

}
