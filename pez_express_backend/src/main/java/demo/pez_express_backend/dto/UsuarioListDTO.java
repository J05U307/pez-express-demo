package demo.pez_express_backend.dto;

import demo.pez_express_backend.enums.Estado;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsuarioListDTO {

    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String celular;
    private String usuario;
    private String dni;
    private Estado estado;
    private String rol;

}
