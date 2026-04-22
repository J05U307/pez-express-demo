package demo.pez_express_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(indexes = {
        @Index(name = "idx_pago_fecha",   columnList = "fechaHora"),
        @Index(name = "idx_pago_pedido",  columnList = "id_pedido"),
        @Index(name = "idx_pago_usuario", columnList = "id_usaurio_cobro")
})
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPago;

    private Double total;
    private LocalDateTime fechaHora;

    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @OneToMany(mappedBy = "pago", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<DetallePago> detallePagos;

    @ManyToOne
    @JoinColumn(name = "id_usaurio_cobro")
    private Usuario usuario;
}