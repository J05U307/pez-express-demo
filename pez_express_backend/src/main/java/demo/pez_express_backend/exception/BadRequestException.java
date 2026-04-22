package demo.pez_express_backend.exception;

public class BadRequestException  extends RuntimeException {

    public BadRequestException(String mensaje) {
        super(mensaje);
    }
}

// Algo invalido  400