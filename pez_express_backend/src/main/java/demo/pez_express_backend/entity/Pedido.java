package demo.pez_express_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import demo.pez_express_backend.enums.EstadoPedido;
import demo.pez_express_backend.enums.TipoPedido;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(indexes = {
        @Index(name = "idx_pedido_estado",        columnList = "estado"),
        @Index(name = "idx_pedido_fecha",         columnList = "fechaApertura"),
        @Index(name = "idx_pedido_estado_fecha",  columnList = "estado, fechaApertura"),
        @Index(name = "idx_pedido_mesa",          columnList = "id_mesa"),
        @Index(name = "idx_pedido_mesero",        columnList = "id_mesero")
})
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter

public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPedido;

    @Enumerated(EnumType.STRING)
    private TipoPedido tipo;

    private LocalDateTime fechaApertura;

    private Double total;

    @Enumerated(EnumType.STRING)
    private EstadoPedido estado;

    @ManyToOne
    @JoinColumn(name = "id_mesa", nullable = true)
    private Mesa mesa;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = true)
    private Cliente cliente;


    @ManyToOne
    @JoinColumn(name = "id_mesero", nullable = false)
    private Usuario mesero;


    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DetallePedido> detallePedidos = new ArrayList<>();

    // RElacion con pago :
    @OneToMany(mappedBy = "pedido")
    @JsonIgnore
    private List<Pago> pagos;

}
