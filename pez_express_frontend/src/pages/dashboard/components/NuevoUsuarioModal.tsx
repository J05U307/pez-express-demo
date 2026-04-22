// src/pages/dashboard/usuarios/components/NuevoUsuarioModal.tsx

import { useState, useEffect } from "react";
import { User, Phone, CreditCard, AtSign, AlertCircle, UserPlus } from "lucide-react";
import { BaseModal } from "../../../components/ui/modal/BaseModal";
import { Field, inputCls } from "../../../components/ui/modal/Field";
import { ModalFooter } from "../../../components/ui/modal/ModalFooter";
import { createUsuario } from "../../../services/usuarioService";
import type { UsuarioCreateDTO } from "../../../types/dtos/UsuarioCreateDTO";

/* ─── Validación ──────────────────────────────────────────────── */

type FormFields = keyof UsuarioCreateDTO;
type FieldErrors = Partial<Record<FormFields, string>>;

function validate(form: UsuarioCreateDTO): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  if (!form.apellido.trim()) errors.apellido = "El apellido es obligatorio.";
  if (!form.usuario.trim()) errors.usuario = "El usuario es obligatorio.";
  if (!form.celular.trim()) {
    errors.celular = "El celular es obligatorio.";
  } else if (!/^\d{9}$/.test(form.celular.trim())) {
    errors.celular = "Debe tener exactamente 9 dígitos.";
  }
  if (!form.dni?.trim()) {
    errors.dni = "El DNI es obligatorio.";
  } else if (!/^\d{8}$/.test(form.dni.trim())) {
    errors.dni = "Debe tener exactamente 8 dígitos.";
  }
  return errors;
}

function parseServerError(message: string): { field: FormFields | null; message: string } {
  if (message.toLowerCase().includes("usuario")) return { field: "usuario", message };
  if (message.toLowerCase().includes("dni")) return { field: "dni", message };
  return { field: null, message };
}

/* ─── Constantes ──────────────────────────────────────────────── */

const EMPTY: UsuarioCreateDTO = {
  nombre: "",
  apellido: "",
  celular: "",
  usuario: "",
  dni: "",
};

/* ─── Componente ──────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NuevoUsuarioModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<UsuarioCreateDTO>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FormFields, boolean>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setTouched({});
      setServerError(null);
      setSaved(false);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Campos numéricos: solo dígitos
    const numericFields: FormFields[] = ["celular", "dni"];
    const sanitized = numericFields.includes(name as FormFields)
      ? value.replace(/\D/g, "")
      : value;
    const updated = { ...form, [name]: sanitized };
    setForm(updated);
    if (serverError) setServerError(null);
    if (touched[name as FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: validate(updated)[name as FormFields] }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(form)[name as FormFields] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<FormFields, boolean>
    );
    setTouched(allTouched);
    const newErrors = validate(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      setServerError(null);
      await createUsuario(form);
      setSaved(true);
      setTimeout(() => { setSaved(false); onSuccess(); }, 900);
    } catch (error: any) {
      const raw: string =
        error?.response?.data?.error ||
        error?.message ||
        "Ocurrió un error inesperado.";
      const parsed = parseServerError(raw);
      if (parsed.field) {
        setErrors((prev) => ({ ...prev, [parsed.field!]: parsed.message }));
        setTouched((prev) => ({ ...prev, [parsed.field!]: true }));
      } else {
        setServerError(parsed.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      loading={loading}
      icon={<UserPlus size={20} className="text-white" strokeWidth={2.2} />}
      title="Nuevo Usuario"
      subtitle="Todos los campos son obligatorios"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {serverError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Nombre"
            icon={<User size={13} />}
            error={touched.nombre ? errors.nombre : undefined}
          >
            <input
              name="nombre"
              placeholder="Ej. Juan"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="given-name"
              autoFocus={false}
              disabled={loading}
              className={inputCls(Boolean(touched.nombre && errors.nombre))}
            />
          </Field>

          <Field
            label="Apellido"
            icon={<User size={13} />}
            error={touched.apellido ? errors.apellido : undefined}
          >
            <input
              name="apellido"
              placeholder="Ej. Pérez"
              value={form.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="family-name"
              disabled={loading}
              className={inputCls(Boolean(touched.apellido && errors.apellido))}
            />
          </Field>

          <Field
            label="Usuario"
            icon={<AtSign size={13} />}
            error={touched.usuario ? errors.usuario : undefined}
            className="col-span-2"
          >
            <input
              name="usuario"
              placeholder="Ej. jperez"
              value={form.usuario}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="username"
              autoCapitalize="none"
              disabled={loading}
              className={inputCls(Boolean(touched.usuario && errors.usuario))}
            />
          </Field>

          <Field
            label="Celular"
            icon={<Phone size={13} />}
            error={touched.celular ? errors.celular : undefined}
            hint="9 dígitos"
          >
            <input
              name="celular"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="987654321"
              value={form.celular}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
              maxLength={9}
              disabled={loading}
              className={inputCls(Boolean(touched.celular && errors.celular))}
            />
          </Field>

          <Field
            label="DNI"
            icon={<CreditCard size={13} />}
            error={touched.dni ? errors.dni : undefined}
            hint="8 dígitos"
          >
            <input
              name="dni"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="12345678"
              value={form.dni ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={8}
              disabled={loading}
              className={inputCls(Boolean(touched.dni && errors.dni))}
            />
          </Field>
        </div>

        <ModalFooter
          onClose={onClose}
          loading={loading}
          saved={saved}
          labelSubmit="Guardar Usuario"
        />
      </form>
    </BaseModal>
  );
}