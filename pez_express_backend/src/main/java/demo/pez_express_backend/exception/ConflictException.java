package demo.pez_express_backend.exception;

public class ConflictException extends RuntimeException {
    public ConflictException(String mensaje) {
        super(mensaje);
    }
}

//Confictos de estado : 409