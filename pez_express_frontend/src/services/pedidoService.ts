// src/services/pedidoService.ts
import api from "./axios";
import type { Pedido } from "../types/Pedido";
import type { PedidoCreateDTO } from "../types/dtos/Pedidodto";

const BASE = "/api/pedidos";


//export async function getPedidos(): Promise<Pedido[]> {
 // const { data } = await api.get<Pedido[]>(BASE);
  //return data;
//}


export async function getPedidosAbiertosHoy(): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>(`${BASE}/abiertos-hoy`);
  return data;
}


export async function getPedidosPorFecha(fecha: string): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>(`${BASE}/por-fecha`, {
    params: { fecha }, // envía ?fecha=2026-03-16
  });
  return data;
}


export async function getPedidoById(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`${BASE}/${id}`);
  return data;
}

export async function createPedido(dto: PedidoCreateDTO): Promise<Pedido> {
  const { data } = await api.post<Pedido>(BASE, dto);
  return data;
}

export async function updatePedido(id: number, dto: PedidoCreateDTO): Promise<Pedido> {
  const { data } = await api.put<Pedido>(`${BASE}/${id}`, dto);
  return data;
}

// FIX: endpoint PATCH para cancelar pedido
export async function cancelarPedido(id: number): Promise<void> {
  await api.patch(`${BASE}/${id}/cancelar`);
}