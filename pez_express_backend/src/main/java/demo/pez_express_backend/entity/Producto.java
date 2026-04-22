package demo.pez_express_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.enums.TipoProducto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    private String nombre;
    private String descripcion;

    private Double precio;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    private boolean manejoStock;

    private boolean imprimeCocina;

    @Enumerated(EnumType.STRING)
    private TipoProducto tipoProducto;



    // Relaciones

    @OneToOne(mappedBy = "producto",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true)
    @JsonIgnore
    private StockProducto stockProducto;


    @OneToMany(mappedBy = "producto")
    @JsonIgnore
    private List<DetallePedido> detallePedidos;


    @OneToMany(mappedBy = "producto")
    @JsonIgnore
    private List<Receta> recetas;
}
