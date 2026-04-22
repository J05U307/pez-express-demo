// src/types/Pedido.ts

export type TipoPedido    = "MESA" | "LLEVAR";
export type EstadoPedido  = "ABIERTO" | "CERRADO" | "ANULADO";

export interface PedidoDetalle {
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  observacion: string
}

export interface Pedido {
  idPedido: number;
  fechaApertura: string;
  tipoPedido: TipoPedido;
  total: number;
  estadoPedido: EstadoPedido;
  idMesa: number | null;
  detalles: PedidoDetalle[];
}