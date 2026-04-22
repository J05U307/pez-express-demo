// src/types/Comanda.ts
export type TipoComanda = "NUEVO" | "CANCELADO";

export interface Comanda {
  idComanda:      number;
  idPedido:       number;
  idMesa:         number | null;
  nombreProducto: string;
  cantidad:       number;
  tipo:           TipoComanda;
  fechaHora:      string;
  observacion:    string;
 
}