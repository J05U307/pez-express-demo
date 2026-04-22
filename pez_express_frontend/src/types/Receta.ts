
export interface RecetaDetalle {
  IdInsumo: number;       // tal como viene del backend
  cantidadUsada: number;
  nombreInsumo: string;
  unidadMedida: string;
}

export interface Receta {
  idProducto: number;
  nombreProducto: string;
  receta: RecetaDetalle[];
}
