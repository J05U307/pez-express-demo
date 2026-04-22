package demo.pez_express_backend.serviceImpl;

import demo.pez_express_backend.dto.CambiarPasswordDTO;
import demo.pez_express_backend.dto.RegisterRequest;
import demo.pez_express_backend.dto.UsuarioListDTO;
import demo.pez_express_backend.entity.Rol;
import demo.pez_express_backend.entity.Usuario;
import demo.pez_express_backend.enums.Estado;
import demo.pez_express_backend.exception.NotFoundException;
import demo.pez_express_backend.repository.RolRepository;
import demo.pez_express_backend.repository.UsuarioRepository;
import demo.pez_express_backend.security.RefreshTokenService;
import demo.pez_express_backend.service.RolService;
import demo.pez_express_backend.service.UsuarioService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public UsuarioServiceImpl(
            RolRepository rolRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    public Usuario crear(RegisterRequest request) {
        // 🔹 Validar si ya existe el usuario
        if (usuarioRepository.existsByUsuario(request.getUsuario())) {
            throw new RuntimeException("El nombre de usuario ya está registrado");
        }

        // 🔹 Validar si ya existe el DNI
        if (usuarioRepository.existsByDni(request.getDni())) {
            throw new RuntimeException("El DNI ya está registrado");
        }


        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setCelular(request.getCelular());
        usuario.setUsuario(request.getUsuario());
        usuario.setDni(request.getDni());
        usuario.setPassword(passwordEncoder.encode(request.getDni()));
        usuario.setPasswordTemporal(true);

        // EL administradador crea el usuarios.
        // El sistema pone su dni como contraseña para que luego el usuario lo pueda cambiar


        usuario.setEstado(Estado.ACTIVO);

        Rol rolUsuario = rolRepository.findByNombre("MESERO")
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.setRol(rolUsuario);

        return usuarioRepository.save(usuario);
    }

    @Override
    public Usuario actualizarPassword(CambiarPasswordDTO dto) {

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if(!passwordEncoder.matches(dto.getPasswordActual(), usuario.getPassword())){
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(dto.getPasswordNuevo()));

        usuario.setPasswordTemporal(false);
        return usuarioRepository.save(usuario);
    }


    @Override
    public Usuario actualizar(Long id, Usuario usuario) {

        /*
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        existente.setNombre(usuario.getNombre());
        existente.setApellido(usuario.getApellido());
        existente.setCelular(usuario.getCelular());
        existente.setUsuario(usuario.getUsuario());
        existente.setEstado(usuario.getEstado());
        existente.setRol(usuario.getRol());

        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            existente.setPassword(usuario.getPassword());
        }


         */
        return null;
    }

    @Override
    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    @Override
    public List<UsuarioListDTO> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(usuario -> new UsuarioListDTO(
                        usuario.getIdUsuario(),
                        usuario.getNombre(),
                        usuario.getApellido(),
                        usuario.getCelular(),
                        usuario.getUsuario(),
                        usuario.getDni(),
                        usuario.getEstado(),
                        usuario.getRol().getNombre()
                ))
                .toList();

    }

    @Override
    public Optional<Usuario> listarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Override
    public void cambiarEstado(Long id, Estado estado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setEstado(estado);
        usuarioRepository.save(usuario);

        // REVOKAR TODOS LOS TOKENS DE ESTE USUARIO
        refreshTokenService.revokeAllTokensForUser(usuario);
    }


}

