// Datos simulados (sin base de datos todavía).
export type Tipo = "entrada" | "salida";
export type Registro = { tipo: Tipo; fecha: Date };
export type Cuenta = {
  dni: string;
  password: string;
  nombre: string;
  rol: "Personal";
  suspendida?: boolean;
  ultimo: Registro | null;
};

const ayer = new Date();
ayer.setDate(ayer.getDate() - 1);
ayer.setHours(18, 2, 0, 0);

export const CUENTAS: Cuenta[] = [
  { dni: "30111222", password: "Suerte2026!", nombre: "Lucía Fernández", rol: "Personal", ultimo: { tipo: "salida", fecha: ayer } },
  { dni: "35444555", password: "Suerte2026!", nombre: "Martín Gómez", rol: "Personal", ultimo: null },
  { dni: "28999000", password: "Suerte2026!", nombre: "Carla Ruiz", rol: "Personal", suspendida: true, ultimo: null },
];

export const fmtFecha = (d: Date) =>
  d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const fmtHora = (d: Date, s = false) =>
  d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", ...(s ? { second: "2-digit" } : {}), hour12: false });
export const fmtCorta = (d: Date) => d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
