// src/services/configuracionGeneralService.ts
import api from "./axios";

export interface ConfiguracionGeneral {
  horaInicio: string;
  horaFin: string;
  qrYapeUrl: string | null;
  diasAtencion: string[]; // ["LUNES", "MARTES", ...]
}

const CLOUD_NAME    = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

export async function subirQrCloudinary(archivo: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "pez_express");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Error al subir imagen a Cloudinary");
  const data = await res.json();
  return data.secure_url as string;
}

const BASE = "/api/configuracion";

export async function getConfiguracionGeneral(): Promise<ConfiguracionGeneral> {
  const { data } = await api.get<ConfiguracionGeneral>(BASE);
  return data;
}

export async function updateConfiguracionGeneral(
  dto: ConfiguracionGeneral
): Promise<ConfiguracionGeneral> {
  const { data } = await api.put<ConfiguracionGeneral>(BASE, dto);
  return data;
}