// src/types/Mesa.ts

export type DisponibilidadEstado = "LIBRE" | "OCUPADO";

export interface Mesa {
  idMesa: number;
  numeroMesa: number;
  disponibilidadEstado: DisponibilidadEstado;
  estado: "ACTIVO" | "INACTIVO";
}