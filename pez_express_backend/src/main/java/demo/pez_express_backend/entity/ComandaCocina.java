package demo.pez_express_backend.entity;

import demo.pez_express_backend.enums.TipoComanda;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(indexes = {
        @Index(name = "idx_comanda_pedido",       columnList = "id_pedido"),
        @Index(name = "idx_comanda_tipo_fecha",   columnList = "tipo, fechaHora"),
        @Index(name = "idx_comanda_producto",     columnList = "id_producto")
})
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ComandaCocina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idComanda;

    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_producto")
    private Producto producto;

    private int cantidad;

    @Enumerated(EnumType.STRING)
    private TipoComanda tipo;

    private LocalDateTime fechaHora;
    private String observacion;
}