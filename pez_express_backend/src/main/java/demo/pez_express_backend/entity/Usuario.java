package demo.pez_express_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import demo.pez_express_backend.enums.Estado;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(indexes = {
        // usuario y dni ya tienen índice único implícito por @Column(unique=true)
        @Index(name = "idx_usuario_estado", columnList = "estado"),
        @Index(name = "idx_usuario_rol",    columnList = "id_rol")
})
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    private String nombre;
    private String apellido;
    private String celular;

    @Column(unique = true)
    private String usuario;

    private String password;

    @Column(unique = true)
    private String dni;

    private boolean passwordTemporal;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @OneToMany(mappedBy = "mesero")
    @JsonIgnore
    private List<Pedido> pedidos;

    @OneToMany(mappedBy = "usuario")
    @JsonIgnore
    private List<Pago> pagos;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(rol.getNombre()));
    }

    @Override public String getUsername() { return usuario; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return estado == Estado.ACTIVO; }
}