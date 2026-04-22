// src/pages/dashboard/configuracion/General.tsx

import { useEffect, useState, useRef } from "react";
import {
  Settings, Clock, QrCode, Save, Upload, Check,
  Loader2, AlertCircle, Trash2, ZoomIn,
} from "lucide-react";
import {
  getConfiguracionGeneral,
  updateConfiguracionGeneral,
  subirQrCloudinary,
  type ConfiguracionGeneral,
} from "../../../services/configuracionGeneralService";

/* ─── Helpers ─────────────────────────────────────────────────── */

function toTimeInput(val: string | null): string {
  if (!val) return "";
  return val.slice(0, 5);
}

function toTimeBackend(val: string): string {
  return val ? `${val}:00` : "";
}

/* ─── Sub-componentes ─────────────────────────────────────────── */

function Alerta({ tipo, mensaje }: { tipo: "error" | "success"; mensaje: string }) {
  const isError = tipo === "error";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, borderRadius: 10,
      padding: "8px 12px", marginBottom: 12,
      background: isError ? "#fef2f2" : "#f0fdf4",
      border: `1.5px solid ${isError ? "#fecaca" : "#86efac"}`,
    }}>
      {isError
        ? <AlertCircle size={13} color="#ef4444" />
        : <Check size={13} color="#22c55e" />
      }
      <span style={{ fontSize: 12, color: isError ? "#991b1b" : "#166534" }}>{mensaje}</span>
    </div>
  );
}

function BtnPrimario({ onClick, loading, color, icon, label }: {
  onClick: () => void; loading: boolean; color: string;
  icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        width: "100%", padding: "11px", borderRadius: 13,
        background: loading ? "#e2e8f0" : color,
        color: loading ? "#94a3b8" : "#fff",
        border: "none", cursor: loading ? "not-allowed" : "pointer",
        fontSize: 13, fontWeight: 700, transition: "background 0.2s",
      }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

/* ─── Componente principal ────────────────────────────────────── */

export default function General() {
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);

  const [loadingData, setLoadingData] = useState(true);
  const [savingHorario, setSavingHorario] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [savingQr, setSavingQr] = useState(false);

  const [errorHorario, setErrorHorario] = useState<string | null>(null);
  const [errorQr, setErrorQr] = useState<string | null>(null);
  const [okHorario, setOkHorario] = useState(false);
  const [okQr, setOkQr] = useState(false);

  const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
  const DIAS_LABEL: Record<string, string> = {
    LUNES: "Lun", MARTES: "Mar", MIERCOLES: "Mié",
    JUEVES: "Jue", VIERNES: "Vie", SABADO: "Sáb", DOMINGO: "Dom",
  };

  const [diasAtencion, setDiasAtencion] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getConfiguracionGeneral()
      .then((data) => {
        setHoraInicio(toTimeInput(data.horaInicio));
        setHoraFin(toTimeInput(data.horaFin));
        setQrUrl(data.qrYapeUrl);
        setDiasAtencion(data.diasAtencion ?? []);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const buildDTO = (overrides: Partial<ConfiguracionGeneral>): ConfiguracionGeneral => ({
    horaInicio: toTimeBackend(horaInicio),
    horaFin: toTimeBackend(horaFin),
    qrYapeUrl: qrUrl,
    diasAtencion: diasAtencion,
    ...overrides,
  });

  /* ── Guardar horario ── */
  const guardarHorario = async () => {
    if (!horaInicio || !horaFin) { setErrorHorario("Debes ingresar ambas horas."); return; }
    if (horaInicio >= horaFin) { setErrorHorario("La hora de inicio debe ser menor a la de fin."); return; }
    if (diasAtencion.length === 0) { setErrorHorario("Selecciona al menos un día de atención."); return; }
    try {
      setSavingHorario(true); setErrorHorario(null);
      await updateConfiguracionGeneral(buildDTO({
        horaInicio: toTimeBackend(horaInicio),
        horaFin: toTimeBackend(horaFin),
      }));
      setOkHorario(true);
      setTimeout(() => setOkHorario(false), 3000);
    } catch { setErrorHorario("No se pudo guardar el horario."); }
    finally { setSavingHorario(false); }
  };

  /* ── Seleccionar imagen ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setOkQr(false); setErrorQr(null);
  };

  /* ── Subir QR ── */
  const subirQr = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setErrorQr("Selecciona una imagen primero."); return; }
    try {
      setUploadingQr(true); setErrorQr(null);
      const url = await subirQrCloudinary(file);
      setQrUrl(url);
      setSavingQr(true);
      await updateConfiguracionGeneral(buildDTO({ qrYapeUrl: url }));
      setPreview(null);
      setOkQr(true);
      setTimeout(() => setOkQr(false), 3000);
      if (fileRef.current) fileRef.current.value = "";
    } catch { setErrorQr("Error al subir la imagen. Intenta de nuevo."); }
    finally { setUploadingQr(false); setSavingQr(false); }
  };

  /* ── Quitar QR ── */
  const quitarQr = async () => {
    try {
      setErrorQr(null);
      await updateConfiguracionGeneral(buildDTO({ qrYapeUrl: null }));
      setQrUrl(null); setPreview(null); setConfirmarQuitar(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch { setErrorQr("No se pudo quitar el QR."); }
  };

  const cargandoQr = uploadingQr || savingQr;
  const imagenActiva = preview ?? qrUrl;

  if (loadingData) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
        Cargando configuración...
      </div>
    );
  }

  return (
    <>
      {/* ── Estilos responsive ── */}
      <style>{`
        .general-wrap { max-width: 520px; }
        @media (max-width: 640px) {
          .general-wrap { max-width: 100%; }
          .horario-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Lightbox ── */}
      {lightbox && imagenActiva && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img
            src={imagenActiva}
            alt="QR Yape"
            style={{
              maxWidth: "90vw", maxHeight: "90vh",
              borderRadius: 20,
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      )}

      <div className="general-wrap" style={{ color: "#1e293b", paddingBottom: 40 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 21, fontWeight: 800, color: "#0f172a", margin: 0,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Settings size={21} color="#06b6d4" />
            General
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 12, margin: "4px 0 0" }}>
            Ajustes generales del sistema
          </p>
        </div>

        {/* ── Horario de atención ── */}
        <div style={{
          background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9",
          padding: "22px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: "#ecfeff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Clock size={17} color="#06b6d4" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Horario de atención</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Solo se podrán crear pedidos dentro de este horario</p>
            </div>
          </div>

          <div
            className="horario-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}
          >
            {[
              { label: "Hora de inicio", value: horaInicio, setter: setHoraInicio },
              { label: "Hora de fin", value: horaFin, setter: setHoraFin },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  type="time"
                  value={value}
                  onChange={(e) => { setter(e.target.value); setErrorHorario(null); }}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 12,
                    border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600,
                    color: "#0f172a", outline: "none", boxSizing: "border-box",
                    background: "#f8fafc",
                  }}
                />
              </div>
            ))}
          </div>

          {/* ── Días de atención ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8 }}>
              Días de atención
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DIAS.map((dia) => {
                const activo = diasAtencion.includes(dia);
                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => {
                      setDiasAtencion((prev) =>
                        activo ? prev.filter((d) => d !== dia) : [...prev, dia]
                      );
                      setErrorHorario(null);
                    }}
                    style={{
                      padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      border: `1.5px solid ${activo ? "#06b6d4" : "#e2e8f0"}`,
                      background: activo ? "#ecfeff" : "#f8fafc",
                      color: activo ? "#0e7490" : "#94a3b8",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {DIAS_LABEL[dia]}
                  </button>
                );
              })}
            </div>
          </div>

          {errorHorario && <Alerta tipo="error" mensaje={errorHorario} />}
          {okHorario && <Alerta tipo="success" mensaje="Horario guardado correctamente" />}

          <BtnPrimario
            onClick={guardarHorario}
            loading={savingHorario}
            color="#06b6d4"
            icon={<Save size={14} />}
            label="Guardar horario"
          />
        </div>

        {/* ── QR Yape ── */}
        <div style={{
          background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9",
          padding: "22px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: "#fffbeb",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <QrCode size={17} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>QR de Yape</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Se mostrará al cliente al momento de pagar con Yape</p>
            </div>
          </div>

          {/* ── Imagen centrada ── */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            {imagenActiva ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={imagenActiva}
                  alt="QR Yape"
                  onClick={() => setLightbox(true)}
                  style={{
                    width: 200, height: 200, objectFit: "contain",
                    borderRadius: 18,
                    border: preview ? "2.5px dashed #f59e0b" : "2px solid #f1f5f9",
                    padding: 10, background: "#fafafa",
                    cursor: "zoom-in", display: "block",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                {/* Badge zoom */}
                <div style={{
                  position: "absolute", bottom: 14, right: 14,
                  background: "rgba(0,0,0,0.45)", borderRadius: 8,
                  padding: "3px 6px", display: "flex", alignItems: "center", gap: 4,
                  pointerEvents: "none",
                }}>
                  <ZoomIn size={11} color="#fff" />
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Ver</span>
                </div>
                {/* Badge "sin guardar" */}
                {preview && (
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: "#f59e0b", borderRadius: 8,
                    padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff",
                  }}>
                    Sin guardar
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 200, height: 200, borderRadius: 18,
                  border: "2px dashed #e2e8f0", background: "#f8fafc",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", gap: 8,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#06b6d4";
                  (e.currentTarget as HTMLDivElement).style.background = "#ecfeff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
                  (e.currentTarget as HTMLDivElement).style.background = "#f8fafc";
                }}
              >
                <QrCode size={36} color="#cbd5e1" />
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 500 }}>Sin QR configurado</p>
                <p style={{ fontSize: 11, color: "#06b6d4", margin: 0, fontWeight: 600 }}>Click para subir</p>
              </div>
            )}
          </div>

          {/* Input file oculto */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* Botones */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={cargandoQr}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                width: "100%", padding: "11px", borderRadius: 13,
                background: "#f8fafc", color: "#475569",
                border: "1.5px solid #e2e8f0",
                cursor: cargandoQr ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 600,
              }}
            >
              <Upload size={14} />
              {preview ? "Cambiar imagen" : "Seleccionar imagen QR"}
            </button>

            {preview && (
              <BtnPrimario
                onClick={subirQr}
                loading={cargandoQr}
                color="#f59e0b"
                icon={<Save size={14} />}
                label={uploadingQr ? "Subiendo..." : savingQr ? "Guardando..." : "Guardar QR"}
              />
            )}

            {qrUrl && !preview && !confirmarQuitar && (
              <button
                onClick={() => setConfirmarQuitar(true)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  width: "100%", padding: "10px", borderRadius: 13,
                  background: "#fef2f2", color: "#ef4444",
                  border: "1.5px solid #fecaca",
                  cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}
              >
                <Trash2 size={14} />
                Quitar QR
              </button>
            )}

            {/* ── Confirmación quitar ── */}
            {confirmarQuitar && (
              <div style={{
                background: "#fef2f2", border: "1.5px solid #fecaca",
                borderRadius: 14, padding: "14px 16px",
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#991b1b", margin: "0 0 12px", textAlign: "center" }}>
                  ¿Seguro que quieres quitar el QR?
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setConfirmarQuitar(false)}
                    style={{
                      flex: 1, padding: "9px", borderRadius: 11,
                      background: "#f1f5f9", color: "#475569",
                      border: "1.5px solid #e2e8f0",
                      cursor: "pointer", fontSize: 13, fontWeight: 600,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={quitarQr}
                    style={{
                      flex: 1, padding: "9px", borderRadius: 11,
                      background: "#ef4444", color: "#fff",
                      border: "none",
                      cursor: "pointer", fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    <Trash2 size={13} />
                    Sí, quitar
                  </button>
                </div>
              </div>
            )}
          </div>

          {errorQr && <div style={{ marginTop: 10 }}><Alerta tipo="error" mensaje={errorQr} /></div>}
          {okQr && <div style={{ marginTop: 10 }}><Alerta tipo="success" mensaje="QR actualizado correctamente" /></div>}
        </div>
      </div>
    </>
  );
}