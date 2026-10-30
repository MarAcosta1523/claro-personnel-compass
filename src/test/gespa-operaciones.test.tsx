import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Usuarios } from "@/components/gespa/gerente/Usuarios";
import { Fichas } from "@/components/gespa/gerente/Fichas";
import { Asistencias } from "@/components/gespa/gerente/Asistencias";
import { ASISTENCIAS, FICHAS, USUARIOS } from "@/components/gespa/data";

afterEach(() => { cleanup(); vi.useRealTimers(); });
const avanzar = () => act(() => vi.advanceTimersByTime(800));

describe("Operaciones de gestión", () => {
  it.each(["usuarios", "fichas"] as const)("registrar, modificar y suspender %s solo aplica cambios tras un intento exitoso", (entidad) => {
    vi.useFakeTimers();
    const cambio = vi.fn();
    const notificar = vi.fn();
    function Pantalla() {
      const [usuarios, setUsuarios] = useState(USUARIOS);
      const [fichas, setFichas] = useState(FICHAS);
      return entidad === "usuarios"
        ? <Usuarios usuarios={usuarios} setUsuarios={(u) => { cambio(u); setUsuarios(u); }} notificar={notificar} />
        : <Fichas fichas={fichas} setFichas={(f) => { cambio(f); setFichas(f); }} notificar={notificar} />;
    }
    render(<Pantalla />);
    fireEvent.click(screen.getByRole("button", { name: entidad === "usuarios" ? "Registrar usuario" : "Registrar ficha de personal" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(cambio).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: "Elena" } });
    fireEvent.change(screen.getByLabelText(/^Apellido/), { target: { value: "Torres" } });
    fireEvent.change(screen.getByLabelText(/^DNI/), { target: { value: "40123456" } });
    if (entidad === "usuarios") {
      fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: "Suerte2026!" } });
      fireEvent.change(screen.getByLabelText(/^Confirmá la contraseña/), { target: { value: "Suerte2026!" } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" })); avanzar();
    expect(cambio).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" })); avanzar();
    expect(cambio).toHaveBeenCalledTimes(1);
    expect(cambio.mock.calls[0]?.[0]).toEqual(expect.arrayContaining([expect.objectContaining({ nombre: "Elena", dni: "40123456" })]));
    expect(notificar).toHaveBeenLastCalledWith("exito", expect.any(String), expect.any(String));
    fireEvent.click(screen.getByRole("button", { name: /^Modificar$/ }));
    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: "Elena María" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" })); avanzar();
    expect(cambio).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" })); avanzar();
    expect(cambio).toHaveBeenCalledTimes(2);
    expect(cambio.mock.calls[1]?.[0]).toEqual(expect.arrayContaining([expect.objectContaining({ nombre: "Elena María" })]));
    expect(notificar).toHaveBeenLastCalledWith("exito", expect.any(String), expect.any(String));
    fireEvent.click(screen.getByRole("button", { name: /^Suspender$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, suspender" })); avanzar();
    expect(cambio).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Sí, suspender" })); avanzar();
    expect(cambio).toHaveBeenCalledTimes(3);
    expect(cambio.mock.calls[2]?.[0]).toEqual(expect.arrayContaining([expect.objectContaining({ nombre: "Elena María", estado: entidad === "usuarios" ? "suspendido" : "suspendida" })]));
    expect(notificar).toHaveBeenLastCalledWith("exito", expect.any(String), expect.any(String));
  });

  it("modificar y suspender asistencias no cambia datos inválidos ni fallidos, y notifica los cambios exitosos", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 27));
    const cambio = vi.fn();
    const notificar = vi.fn();
    function Pantalla() {
      const [asistencias, setAsistencias] = useState(ASISTENCIAS);
      return <Asistencias fichas={FICHAS} asistencias={asistencias} setAsistencias={(a) => { cambio(a); setAsistencias(a); }} correcciones={[]} setCorrecciones={() => {}} gerente="Roberto Sosa" notificar={notificar} />;
    }
    render(<Pantalla />);
    fireEvent.click(screen.getByRole("button", { name: "Consultar" })); avanzar();
    fireEvent.click(screen.getAllByRole("button", { name: /Modificar registro del/ })[0] as HTMLElement);
    fireEvent.change(screen.getByLabelText(/^Hora/), { target: { value: "25:80" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(cambio).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/^Hora/), { target: { value: "08:01" } });
    fireEvent.change(screen.getByLabelText("Observación"), { target: { value: "Hora corregida" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" })); avanzar();
    expect(cambio).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" })); avanzar();
    expect(cambio).toHaveBeenCalledTimes(1);
    expect(cambio.mock.calls[0]?.[0]).toEqual(expect.arrayContaining([expect.objectContaining({ id: 1, hora: "08:01", observacion: "Hora corregida" })]));
    expect(notificar).toHaveBeenLastCalledWith("exito", expect.any(String), expect.any(String));
    fireEvent.click(screen.getByRole("button", { name: "Suspender registro del 13/10/2026 08:01" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, suspender" })); avanzar();
    expect(cambio).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Sí, suspender" })); avanzar();
    expect(cambio).toHaveBeenCalledTimes(2);
    expect(cambio.mock.calls[1]?.[0]).toEqual(expect.arrayContaining([expect.objectContaining({ id: 1, suspendida: true })]));
    expect(notificar).toHaveBeenLastCalledWith("exito", expect.any(String));
  });

  it("completar una marca pendiente cambia su estado a completo y deja visibles solo los pendientes restantes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 27));
    const notificar = vi.fn();
    function Pantalla() {
      const [asistencias, setAsistencias] = useState(ASISTENCIAS);
      return <Asistencias fichas={FICHAS} asistencias={asistencias} setAsistencias={setAsistencias} correcciones={[]} setCorrecciones={() => {}} gerente="Roberto Sosa" notificar={notificar} />;
    }
    render(<Pantalla />);
    fireEvent.click(screen.getByRole("button", { name: "Consultar" }));
    avanzar();
    fireEvent.click(screen.getByRole("button", { name: "Completar registro del 15/10/2026 07:58" }));
    fireEvent.change(screen.getByLabelText(/^Hora de salida/), { target: { value: "14:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    avanzar();
    expect(screen.getByRole("alert").textContent).toContain("No se pudo completar el registro");
    expect(screen.getByLabelText(/^Hora de salida/)).toHaveValue("14:00");
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    avanzar();

    const fila = screen.getByText("07:58").closest("tr");
    if (!fila) throw new Error("No se encontró la fila de la asistencia completada");
    expect(within(fila).getByText("Completo")).toBeTruthy();
    expect(screen.getByText("1 registro incompleto")).toBeTruthy();
    expect(notificar).toHaveBeenLastCalledWith("exito", "El registro quedó completo", expect.stringContaining("El estado cambió a Completo."));
  });
});