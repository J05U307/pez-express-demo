package demo.pez_express_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.enums.UnidadMedida;
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
public class Insumo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInsumo;

    private String nombre;

    @Enumerated(EnumType.STRING)
    private UnidadMedida unidadMedida;

    private int stockActual;

    @Enumerated(EnumType.STRING)
    private Estado estado;


    @OneToMany(mappedBy = "insumo")
    @JsonIgnore
    private List<Receta> recetas;

}
