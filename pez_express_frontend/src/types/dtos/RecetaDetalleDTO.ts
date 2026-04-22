// src/types/dtos/RecetaDTO.ts

export interface RecetaDetalleDTO {
  idInsumo: number;
  cantidadUsada: number;
}

export interface RecetaCreateDTO {
  idProducto: number;
  detalles: RecetaDetalleDTO[];
}