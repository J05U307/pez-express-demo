package demo.pez_express_backend.entity;

import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.enums.EstadoMesa;
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
public class Mesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMesa;

    @Column(unique = true)
    private Long numeroMesa;

    @Enumerated(EnumType.STRING)
    private EstadoMesa disponibilidadEstado;

    @Enumerated(EnumType.STRING)
    private Estado estado;





}
