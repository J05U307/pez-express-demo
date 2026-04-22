package demo.pez_express_backend.dto;


import lombok.*;
import java.time.LocalTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionDTO {
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String qrYapeUrl;

    private List<String> diasAtencion;
}