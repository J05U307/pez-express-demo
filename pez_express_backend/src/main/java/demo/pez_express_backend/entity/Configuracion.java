package demo.pez_express_backend.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Configuracion {

    @Id
    private Long id = 1L; // Solo habrá una fila siempre

    private LocalTime horaInicio;
    private LocalTime horaFin;

    @Column(length = 500)
    private String qrYapeUrl; // URL de Cloudinary


    @Column(length = 100)
    private String diasAtencion;
}