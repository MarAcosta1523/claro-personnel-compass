// Datos simulados (sin base de datos todavía).
export type Tipo = "entrada" | "salida";
export type Rol = "Personal" | "Gerente";
export type Registro = { tipo: Tipo; fecha: Date };
export type Cuenta = {
  dni: string;
  password: string;
  nombre: string;
  rol: Rol;
  fichaId?: number;
  suspendida?: boolean;
  ultimo: Registro | null;
};

const ayer = new Date();
ayer.setDate(ayer.getDate() - 1);
ayer.setHours(18, 2, 0, 0);

export const CUENTAS: Cuenta[] = [
  { dni: "30111222", password: "Suerte2026!", nombre: "Lucía Fernández", rol: "Personal", fichaId: 1, ultimo: { tipo: "salida", fecha: ayer } },
  { dni: "35444555", password: "Suerte2026!", nombre: "Martín Gómez", rol: "Personal", fichaId: 2, ultimo: null },
  { dni: "28999000", password: "Suerte2026!", nombre: "Carla Ruiz", rol: "Personal", fichaId: 3, suspendida: true, ultimo: null },
  { dni: "22333444", password: "Gerente2026!", nombre: "Roberto Sosa", rol: "Gerente", ultimo: null },
];

// ---------- Gestión (Gerente) ----------
export type Usuario = { id: number; nombre: string; apellido: string; dni: string; rol: Rol; estado: "activo" | "suspendido"; fichaId?: number | undefined };
export type Ficha = { id: number; nombre: string; apellido: string; dni: string; telefono: string; ingreso: string; estado: "activa" | "suspendida" };
export type Asistencia = { id: number; fichaId: number; fecha: string; hora: string; tipo: Tipo; observacion: string; suspendida?: boolean };
export type Correccion = { id: number; asistenciaId: number; dato: string; anterior: string; nuevo: string; cuando: string; gerente: string };
export type Copia = { id: number; cuando: string; archivo: string; tamano: string };

export const USUARIOS: Usuario[] = [
  { id: 1, nombre: "Roberto", apellido: "Sosa", dni: "22333444", rol: "Gerente", estado: "activo" },
  { id: 2, nombre: "Ana", apellido: "Pereyra", dni: "25666777", rol: "Gerente", estado: "activo" },
  { id: 3, nombre: "Lucía", apellido: "Fernández", dni: "30111222", rol: "Personal", estado: "activo", fichaId: 1 },
  { id: 4, nombre: "Martín", apellido: "Gómez", dni: "35444555", rol: "Personal", estado: "activo", fichaId: 2 },
  { id: 5, nombre: "Carla", apellido: "Ruiz", dni: "28999000", rol: "Personal", estado: "suspendido", fichaId: 3 },
  { id: 6, nombre: "Diego", apellido: "Molina", dni: "33222111", rol: "Personal", estado: "activo", fichaId: 4 },
  { id: 7, nombre: "Sofía", apellido: "Castro", dni: "37888999", rol: "Personal", estado: "activo", fichaId: 5 },
  { id: 8, nombre: "Pablo", apellido: "Ibarra", dni: "31555666", rol: "Personal", estado: "activo", fichaId: 6 },
];

export const FICHAS: Ficha[] = [
  { id: 1, nombre: "Lucía", apellido: "Fernández", dni: "30111222", telefono: "11 4523-8890", ingreso: "2021-03-01", estado: "activa" },
  { id: 2, nombre: "Martín", apellido: "Gómez", dni: "35444555", telefono: "11 3344-1200", ingreso: "2024-08-12", estado: "activa" },
  { id: 3, nombre: "Carla", apellido: "Ruiz", dni: "28999000", telefono: "11 6677-4410", ingreso: "2019-05-20", estado: "suspendida" },
  { id: 4, nombre: "Diego", apellido: "Molina", dni: "33222111", telefono: "11 5012-7788", ingreso: "2022-11-07", estado: "activa" },
  { id: 5, nombre: "Sofía", apellido: "Castro", dni: "37888999", telefono: "11 2299-3456", ingreso: "2025-02-03", estado: "activa" },
  { id: 6, nombre: "Pablo", apellido: "Ibarra", dni: "31555666", telefono: "11 4400-9911", ingreso: "2020-07-15", estado: "activa" },
];

let aid = 0;
const a = (fichaId: number, fecha: string, hora: string, tipo: Tipo, observacion = ""): Asistencia => ({ id: ++aid, fichaId, fecha, hora, tipo, observacion });
export const ASISTENCIAS: Asistencia[] = [
  a(1, "2026-10-13", "08:00", "entrada"), a(1, "2026-10-13", "14:05", "salida"),
  a(1, "2026-10-14", "08:10", "entrada", "Demora del colectivo"), a(1, "2026-10-14", "14:00", "salida"),
  a(1, "2026-10-15", "07:58", "entrada"),
  a(1, "2026-10-16", "08:02", "entrada"), a(1, "2026-10-16", "14:01", "salida"),
  a(1, "2026-10-19", "08:00", "entrada"), a(1, "2026-10-19", "18:02", "salida"),
  a(4, "2026-10-13", "14:00", "entrada"), a(4, "2026-10-13", "21:00", "salida"),
  a(4, "2026-10-14", "14:03", "entrada"), a(4, "2026-10-14", "21:05", "salida"),
  a(4, "2026-10-15", "14:00", "entrada"), a(4, "2026-10-15", "20:30", "salida", "Se retiró antes, avisó"),
  a(5, "2026-10-16", "21:00", "salida", "Olvidó registrar la entrada"),
  a(6, "2026-10-13", "08:00", "entrada"), a(6, "2026-10-13", "13:00", "salida"),
];

export const CORRECCIONES: Correccion[] = [
  { id: 1, asistenciaId: 4, dato: "Hora", anterior: "13:00", nuevo: "14:00", cuando: "2026-10-15 09:12", gerente: "Ana Pereyra" },
  { id: 2, asistenciaId: 15, dato: "Observación", anterior: "", nuevo: "Se retiró antes, avisó", cuando: "2026-10-16 10:40", gerente: "Roberto Sosa" },
];

export const COPIAS: Copia[] = [
  { id: 1, cuando: "2026-10-19 21:15", archivo: "gespa_2026-10-19_2115.bak", tamano: "1,2 MB" },
  { id: 2, cuando: "2026-10-12 21:08", archivo: "gespa_2026-10-12_2108.bak", tamano: "1,1 MB" },
];

// ---------- Reglas ----------
export const POLITICA = [
  { id: "len", texto: "Mínimo 8 caracteres", ok: (p: string) => p.length >= 8 },
  { id: "may", texto: "Una mayúscula", ok: (p: string) => /[A-ZÁÉÍÓÚÑ]/.test(p) },
  { id: "min", texto: "Una minúscula", ok: (p: string) => /[a-záéíóúñ]/.test(p) },
  { id: "num", texto: "Un número", ok: (p: string) => /\d/.test(p) },
  { id: "esp", texto: "Un carácter especial: ! @ # $ % & *", ok: (p: string) => /[!@#$%&*]/.test(p) },
  { id: "sin", texto: "Sin espacios", ok: (p: string) => p.length > 0 && !/\s/.test(p) },
] as const;
export const cumplePolitica = (p: string) => POLITICA.every((r) => r.ok(p));

const min = (h: string) => { const [x = 0, y = 0] = h.split(":").map(Number); return x * 60 + y; };

/** Empareja entrada→salida por ficha y día. Lo que no tiene par queda incompleto (no se infieren ausencias). */
export function analizar(regs: Asistencia[]) {
  const incompletos = new Set<number>();
  let minutos = 0;
  const grupos = new Map<string, Asistencia[]>();
  for (const r of regs.filter((r) => !r.suspendida)) {
    const k = `${r.fichaId}|${r.fecha}`;
    grupos.set(k, [...(grupos.get(k) ?? []), r]);
  }
  for (const g of grupos.values()) {
    g.sort((x, y) => x.hora.localeCompare(y.hora));
    let abierta: Asistencia | null = null;
    for (const r of g) {
      if (r.tipo === "entrada") { if (abierta) incompletos.add(abierta.id); abierta = r; }
      else if (abierta) { minutos += min(r.hora) - min(abierta.hora); abierta = null; }
      else incompletos.add(r.id);
    }
    if (abierta) incompletos.add(abierta.id);
  }
  return { incompletos, minutos };
}
export const fmtHoras = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
export const isoAFecha = (s: string) => s.split("-").reverse().join("/");

export const fmtFecha = (d: Date) =>
  d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const fmtHora = (d: Date, s = false) =>
  d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", ...(s ? { second: "2-digit" } : {}), hour12: false });
export const fmtCorta = (d: Date) => d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
export const ahoraIso = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
