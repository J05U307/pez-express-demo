// src/services/recetaService.ts

import api from "./axios";
import type { Receta } from "../types/Receta";
import type { RecetaCreateDTO } from "../types/dtos/RecetaDetalleDTO";

const BASE = "/api/recetas";

/** Lista todas las recetas con sus detalles */
export async function getRecetas(): Promise<Receta[]> {
  const { data } = await api.get<Receta[]>(BASE);
  return data;
}

/** Obtiene la receta de un producto específico */
export async function getRecetaByProducto(idProducto: number): Promise<Receta> {
  const { data } = await api.get<Receta>(`${BASE}/producto/${idProducto}`);
  return data;
}

/** Crea una receta nueva (el producto no debe tener receta aún) */
export async function createReceta(dto: RecetaCreateDTO): Promise<Receta> {
  const { data } = await api.post<Receta>(BASE, dto);
  return data;
}

/** Edita la receta existente de un producto */
export async function updateReceta(dto: RecetaCreateDTO): Promise<Receta> {
  const { data } = await api.put<Receta>(BASE, dto);
  return data;
}