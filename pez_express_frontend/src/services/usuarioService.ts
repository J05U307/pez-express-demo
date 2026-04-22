// src/services/usuarioService.ts
import api from "./axios";
import type { Usuario } from "../types/Usuario";
import type { UsuarioCreateDTO } from "../types/dtos/UsuarioCreateDTO";


/* =========================
   OBTENER TODOS
========================= */
export const getUsuarios = async (): Promise<Usuario[]> => {
    const response = await api.get("/api/usuarios");
    return response.data;
};

/* =========================
   CREAR (REGISTER)
========================= */
export const createUsuario = async (
    data: UsuarioCreateDTO
): Promise<Usuario> => {
    const response = await api.post("/api/usuarios/register", data);
    return response.data;

};

/* =========================
   CAMBIAR ESTADO
========================= */
export const cambiarEstadoUsuario = async (
  id: number,
  estado: "ACTIVO" | "INACTIVO"
): Promise<void> => {
  await api.patch(`/api/usuarios/${id}/estado`, null, {
    params: { estado },
  });
};


/* =========================
   CAMBIAR CONTRASEÑA
========================= */
export interface CambiarPasswordDTO {
  idUsuario: number;
  passwordActual: string;
  passwordNuevo: string;
}

export const cambiarPassword = async (
  data: CambiarPasswordDTO
): Promise<void> => {
  await api.patch("/api/usuarios/cambiar_password", data);
};