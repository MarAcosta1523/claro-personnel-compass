import type { Asistencia, Cuenta, Ficha, Tipo } from "./data";

export function fichaVinculada(cuenta: Cuenta, fichas: Ficha[]) {
  if (cuenta.rol !== "Personal" || cuenta.suspendida) return undefined;
  return fichas.find((f) => f.id === cuenta.fichaId && f.estado === "activa");
}

export function crearAsistenciaPersonal(cuenta: Cuenta, fichas: Ficha[], registros: Asistencia[], tipo: Tipo, observacion: string, fecha: Date): Asistencia {
  const ficha = fichaVinculada(cuenta, fichas);
  if (!ficha) throw new Error("No se pudo registrar la asistencia. Consultá con el Gerente.");
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    id: Math.max(0, ...registros.map((r) => r.id)) + 1,
    fichaId: ficha.id,
    fecha: `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`,
    hora: `${p(fecha.getHours())}:${p(fecha.getMinutes())}`,
    tipo,
    observacion: observacion.trim(),
  };
}