package demo.pez_express_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(indexes = {
        @Index(name = "idx_receta_producto", columnList = "id_producto"),
        @Index(name = "idx_receta_insumo",   columnList = "id_insumo"),
        // Evita insumos duplicados por producto a nivel de BD
        @Index(name = "idx_receta_prod_ins", columnList = "id_producto, id_insumo", unique = true)
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReceta;

    private int cantidadUsada;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_insumo", nullable = false)
    private Insumo insumo;
}