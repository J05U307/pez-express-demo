package demo.pez_express_backend.event;

// Evento que se publica al guardar o modificar un pedido.
// Spring lo entrega al listener DESPUÉS del commit de la transacción.
public class CocinaNotificacionEvent {

    private final String origen; // para logs: "CREAR", "ACTUALIZAR", "CANCELAR", "PAGO"

    public CocinaNotificacionEvent(String origen) {
        this.origen = origen;
    }

    public String getOrigen() {
        return origen;
    }
}