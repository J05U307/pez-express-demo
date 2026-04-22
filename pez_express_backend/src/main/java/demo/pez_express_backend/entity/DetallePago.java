package demo.pez_express_backend.entity;

import demo.pez_express_backend.enums.MetodoPago;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class DetallePago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetallePago;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;

    private Double monto;

    @ManyToOne
    @JoinColumn(name = "id_pago", nullable = false)
    private Pago pago;


}
