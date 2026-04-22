// src/types/Producto.ts

export type TipoProducto = "PLATO" | "BEBIDA_ENVASA" | "BEBIDA_PREPARADA" | "GUARNICION" | "EXTRA";

export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  manejoStock: boolean;
  imprimeCocina: boolean;
  tipoProducto: TipoProducto;
  stockActual: number | null; // null cuando manejoStock es false
  estado: "ACTIVO" | "INACTIVO";
}