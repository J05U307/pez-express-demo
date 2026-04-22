// src/services/pagoService.ts
import api from "./axios";// mismo axios instance que usas en los demás services

export interface DetallePagoDTO {
  metodoPago: "EFECTIVO" | "YAPE" | "PLIN";
  monto: number;
}

export interface PagoCreateDTO {
  idPedido: number;
  idUsuarioCobro: number;
  detallePagos: DetallePagoDTO[];
}

export interface Pago {
  idPago: number;
  idPedido: number;
  idUsuarioCobro: number;
  nombreUsuarioCobro: string;
  total: number;
  fechaHora: string;
  detallePago: DetallePagoDTO[];
}

export const createPago = async (dto: PagoCreateDTO): Promise<Pago> => {
  const { data } = await api.post<Pago>("/api/pagos", dto);
  return data;
};

export const getPagos = async (): Promise<Pago[]> => {
  const { data } = await api.get<Pago[]>("/api/pagos");
  return data;
};


export const getPagosPorDia = async (fecha: string): Promise<Pago[]> => {
  const { data } = await api.get<Pago[]>(`/api/pagos/dia`, { params: { fecha } });
  return data;
};