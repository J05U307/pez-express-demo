package demo.pez_express_backend.entity;

import demo.pez_express_backend.enums.EstadoDetallePedido;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(indexes = {
        @Index(name = "idx_detalle_pedido",   columnList = "id_pedido"),
        @Index(name = "idx_detalle_producto", columnList = "id_producto"),
        @Index(name = "idx_detalle_estado",   columnList = "estado")
})
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetallePedido;

    private int cantidad;
    private Double precioUnitario;

    @Enumerated(EnumType.STRING)
    private EstadoDetallePedido estado;

    private String observacion;
    private LocalDateTime fechaHora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;
}