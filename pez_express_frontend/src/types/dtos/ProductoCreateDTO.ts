// src/types/dtos/ProductoCreateDTO.ts

import type { TipoProducto } from "../Producto";
import type { Estado } from "../common";

export interface ProductoCreateDTO {
  nombre: string;
  descripcion: string;
  precio: number;
  manejoStock: boolean;
  imprimeCocina: boolean;
  tipoProducto: TipoProducto;
  stockActual?: number; // solo cuando manejoStock es true
  estado: Estado;
}