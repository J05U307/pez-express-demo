package demo.pez_express_backend.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserMeResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String usuario;
    private String dni;
    private String rol;
    private boolean passwordTemporal;
}