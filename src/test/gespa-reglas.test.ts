import { describe, expect, it } from "vitest";
import { analizar, cumplePolitica, type Asistencia } from "@/components/gespa/data";

describe("Política de contraseñas", () => {
  it("acepta una contraseña que cumple todo", () => expect(cumplePolitica("Suerte2026!")).toBe(true));
  it("rechaza menos de 8 caracteres", () => expect(cumplePolitica("Su2026!")).toBe(false));
  it("rechaza sin mayúscula", () => expect(cumplePolitica("suerte2026!")).toBe(false));
  it("rechaza sin minúscula", () => expect(cumplePolitica("SUERTE2026!")).toBe(false));
  it("rechaza sin número", () => expect(cumplePolitica("Suertebien!")).toBe(false));
  it("rechaza especial fuera de ! @ # $ % & *", () => expect(cumplePolitica("Suerte2026?")).toBe(false));
  it("rechaza espacios", () => expect(cumplePolitica("Suerte 2026!")).toBe(false));
});

const r = (id: number, fecha: string, hora: string, tipo: "entrada" | "salida", suspendida = false): Asistencia => ({ id, fichaId: 1, fecha, hora, tipo, observacion: "", suspendida });

describe("Cálculo de asistencias", () => {
  it("suma horas de pares entrada-salida", () => {
    expect(analizar([r(1, "2026-10-13", "08:00", "entrada"), r(2, "2026-10-13", "14:30", "salida")]).minutos).toBe(390);
  });
  it("marca entrada sin salida como incompleta y no la suma", () => {
    const x = analizar([r(1, "2026-10-13", "08:00", "entrada")]);
    expect([...x.incompletos]).toEqual([1]);
    expect(x.minutos).toBe(0);
  });
  it("ignora registros suspendidos", () => {
    expect(analizar([r(1, "2026-10-13", "08:00", "entrada", true)]).incompletos.size).toBe(0);
  });
});
