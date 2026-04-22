// src/types/dtos/PedidoDTO.ts

import type { TipoPedido } from "../Pedido";

export interface PedidoDetalleDTO {
  idProducto: number;
  cantidad: number;
  observacion: string;
}

export interface PedidoCreateDTO {
  idMesa?: number;       // solo cuando tipoPedido = "MESA"
  idMesero: number;
  tipoPedido: TipoPedido;
  detalles: PedidoDetalleDTO[];
}