export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  celular: string;
  usuario: string;
  dni: string | null;
  estado: "ACTIVO" | "INACTIVO";
  rol: "ADMINISTRADOR" | "MESERO";
}