package demo.pez_express_backend.event;

import demo.pez_express_backend.service.ComandaService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class CocinaNotificacionListener {

    private final ComandaService comandaService;

    public CocinaNotificacionListener(ComandaService comandaService) {
        this.comandaService = comandaService;
    }

    // @TransactionalEventListener garantiza que esto corre DESPUÉS del commit.
    // @Async lo ejecuta en un hilo del pool — no bloquea el hilo del request.
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCocinaNotificacion(CocinaNotificacionEvent event) {
        comandaService.notificarCocina();
    }
}