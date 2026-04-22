package demo.pez_express_backend.auth.dto;

import lombok.Data;

@Data
public class LoginRequest {

    private String usuario;
    private  String password;
}
