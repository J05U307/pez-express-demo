import api from "./axios";
import type { Producto } from "../types/Producto";
import type { ProductoCreateDTO } from "../types/dtos/ProductoCreateDTO";

const BASE = "/api/productos";

export async function getProductos(): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>(BASE);
  return data;
}



export async function createProducto(dto: ProductoCreateDTO): Promise<Producto> {
  const { data } = await api.post<Producto>(BASE, dto);
  return data;
}

export async function updateProducto(id: number, dto: ProductoCreateDTO): Promise<Producto> {
  const { data } = await api.put<Producto>(`${BASE}/${id}`, dto);
  return data;
}

export async function deleteProducto(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}
