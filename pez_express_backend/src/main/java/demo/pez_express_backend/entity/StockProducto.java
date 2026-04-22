package demo.pez_express_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class StockProducto {

    @Id
    @Column(name = "id_producto")
    private Long idProducto;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_producto")
    private Producto producto;

    private int stockActual;
}

