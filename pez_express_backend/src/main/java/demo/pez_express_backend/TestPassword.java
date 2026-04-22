package demo.pez_express_backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPassword {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Crear una contraseña codificada usando la firma de jwt secret.
        System.out.println(encoder.encode("tu_contraseña"));
    }

}