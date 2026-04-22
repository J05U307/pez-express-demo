// src/services/insumoService.ts
import api from "./axios";
import type { InsumoCreateDTO } from "../types/dtos/InsumoCreateDTO";
import type { Insumo } from "../types/Insusmo";

// Listar todos los insumos
export const getInsumos = async (): Promise<Insumo[]> => {
  const response = await api.get<Insumo[]>("/api/insumos");
  return response.data;
};

// Crear un insumo
export const createInsumo = async (insumo: InsumoCreateDTO): Promise<Insumo> => {
  const response = await api.post<Insumo>("/api/insumos", insumo);
  return response.data;
};

// Editar un insumo
export const updateInsumo = async (id: number, insumo: InsumoCreateDTO): Promise<Insumo> => {
  const response = await api.put<Insumo>(`/api/insumos/${id}`, insumo);
  return response.data;
};

// Eliminar un insumo
export const deleteInsumo = async (id: number): Promise<void> => {
  await api.delete(`/api/insumos/${id}`);
};