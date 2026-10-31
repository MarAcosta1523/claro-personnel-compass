import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { crearAsistenciaPersonal } from "@/components/gespa/asistencia-personal";
import { CUENTAS, FICHAS } from "@/components/gespa/data";
import { Login } from "@/components/gespa/Login";
import { Index } from "@/routes/index";

afterEach(() => { cleanup(); vi.useRealTimers(); });

function cuenta(dni: string) {
  const c = CUENTAS.find((c) => c.dni === dni);
  if (!c) throw new Error("Falta la cuenta de prueba");
  return c;
}

describe("Asistencia vinculada a la cuenta Personal", () => {
  it("asocia entrada y salida con la ficha de la cuenta, incluyendo la observación opcional", () => {
    const fecha = new Date(2026, 9, 27, 8, 15);
    const entrada = crearAsistenciaPersonal(cuenta("30111222"), FICHAS, [], "entrada", "Llegué temprano", fecha);
    const salida = crearAsistenciaPersonal(cuenta("30111222"), FICHAS, [entrada], "salida", "", fecha);
    expect(entrada).toMatchObject({ fichaId: 1, tipo: "entrada", observacion: "Llegué temprano", fecha: "2026-10-27", hora: "08:15" });
    expect(salida).toMatchObject({ fichaId: 1, tipo: "salida", observacion: "" });
    expect(salida.id).not.toBe(entrada.id);
  });

  it("no asocia la asistencia con la ficha de otra persona", () => {
    const registro = crearAsistenciaPersonal(cuenta("35444555"), FICHAS, [], "entrada", "", new Date());
    expect(registro.fichaId).toBe(2);
    expect(registro.fichaId).not.toBe(1);
  });

  it("impide el ingreso de Personal sin una ficha vinculada", () => {
    vi.useFakeTimers();
    const ingresar = vi.fn();
    render(<Login onIngresar={ingresar} fichas={[]} />);
    fireEvent.change(screen.getByLabelText("DNI"), { target: { value: "30111222" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "Suerte2026!" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    act(() => vi.advanceTimersByTime(800));
    expect(ingresar).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("No se pudo iniciar sesión");
  });

  it("no registra asistencia cuando falta la ficha de la cuenta", () => {
    expect(() => crearAsistenciaPersonal({ ...cuenta("30111222"), fichaId: undefined }, FICHAS, [], "entrada", "", new Date())).toThrow();
  });

  it("permite al Gerente consultar las marcas de Personal después de cambiar de sesión", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 27, 8, 15));
    render(<Index />);
    const ingresar = (dni: string, pass: string) => {
      fireEvent.change(screen.getByLabelText("DNI"), { target: { value: dni } });
      fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: pass } });
      fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
      act(() => vi.advanceTimersByTime(800));
    };
    ingresar("30111222", "Suerte2026!");
    expect(screen.queryByLabelText("DNI")).toBeNull();
    expect(screen.queryByLabelText("Persona")).toBeNull();
    expect(screen.getByText("#1")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /Registrar entrada/ }));
    fireEvent.change(screen.getByLabelText(/Observación/), { target: { value: "Marca de Lucía" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByRole("status").textContent).toContain("Asistencia registrada con éxito");
    fireEvent.click(screen.getByRole("radio", { name: /Registrar salida/ }));
    fireEvent.change(screen.getByLabelText(/Observación/), { target: { value: "Fin de jornada" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByRole("status").textContent).toContain("Asistencia registrada con éxito");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    ingresar("22333444", "Gerente2026!");
    fireEvent.click(screen.getAllByRole("button", { name: /Gestionar asistencias/ })[0] as HTMLElement);
    fireEvent.change(screen.getByLabelText("Persona"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2026-10-27" } });
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2026-10-27" } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar" }));
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByRole("cell", { name: "Marca de Lucía" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Fin de jornada" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Persona"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar" }));
    act(() => vi.advanceTimersByTime(700));
    expect(screen.queryByRole("cell", { name: "Marca de Lucía" })).toBeNull();
  });
});