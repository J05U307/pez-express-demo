// src/services/mesaService.ts

import api from "./axios";
import type { Mesa } from "../types/Mesa";

const BASE = "/api/mesas";

export async function getMesas(): Promise<Mesa[]> {
  const { data } = await api.get<Mesa[]>(BASE);
  return data;
}

export async function createMesa(): Promise<Mesa> {
  const { data } = await api.post<Mesa>(BASE);
  return data;
}