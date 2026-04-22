INSERT IGNORE INTO rol (id_rol, nombre, descripcion) VALUES (1, 'ADMINISTRADOR', 'Administrador del sistema');
INSERT IGNORE INTO rol (id_rol, nombre, descripcion) VALUES (2, 'MESERO', 'Mesero del restaurante');



INSERT IGNORE INTO usuario (
    id_usuario, nombre, apellido, dni, celular,
    usuario, password, estado, id_rol, password_temporal
)
VALUES (
    1, 'Admin', 'Admin', '00000000', '000000000',
    'admin',
    '$2a$10$TU_HASH_GENERADO_AQUI',
    'ACTIVO', 1, 1
);