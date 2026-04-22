

import api from "./axios";
import type { Comanda } from "../types/Comanda";

const BASE = "/api/cocina";


export async function getComandasActivas(): Promise<Comanda[]> {
  const { data } = await api.get<Comanda[]>(`${BASE}/comandas/activas`);
  return data;
}