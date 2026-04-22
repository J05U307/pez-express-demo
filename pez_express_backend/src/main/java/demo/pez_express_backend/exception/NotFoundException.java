package demo.pez_express_backend.exception;

public class NotFoundException extends RuntimeException{
    public NotFoundException(String mensaje) {
        super(mensaje);
    }
}

// no encontrado  404
