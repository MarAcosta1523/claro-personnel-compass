import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PasswordInput } from "@/components/gespa/PasswordInput";
import { createAttemptTracker } from "@/components/gespa/prototype";
import { Login } from "@/components/gespa/Login";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Controles de contraseña", () => {
  it("revela y vuelve a ocultar cada contraseña de forma independiente", () => {
    render(<><PasswordInput id="clave" aria-label="Clave" value="Suerte2026!" readOnly /><PasswordInput id="confirmacion" aria-label="Confirmación" value="Suerte2026!" readOnly /></>);
    const clave = screen.getByLabelText("Clave");
    const confirmacion = screen.getByLabelText("Confirmación");
    fireEvent.click(screen.getAllByRole("button", { name: "Mostrar contraseña" })[0]);
    expect(clave.getAttribute("type")).toBe("text");
    expect(confirmacion.getAttribute("type")).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(clave.getAttribute("type")).toBe("password");
  });
});

describe("Resultados simulados", () => {
  it.each(["entrada", "salida", "nuevo", "editar", "suspender", "generar"])("%s falla sin aplicar cambios y permite reintentar", (accion) => {
    const falla = createAttemptTracker();
    let registros = 0;
    if (!falla(accion)) registros++;
    expect(registros).toBe(0);
    if (!falla(accion)) registros++;
    expect(registros).toBe(1);
  });
});

describe("Acceso por rol", () => {
  it.each([["30111222", "Suerte2026!", "Personal"], ["22333444", "Gerente2026!", "Gerente"]])("%s ingresa con su rol correspondiente", (dni, pass, rol) => {
    vi.useFakeTimers();
    const ingresar = vi.fn();
    render(<Login onIngresar={ingresar} />);
    fireEvent.change(screen.getByLabelText("DNI"), { target: { value: dni } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: pass } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    act(() => vi.runAllTimers());
    expect(ingresar).toHaveBeenCalledWith(expect.objectContaining({ dni, rol }));
  });
  it("impide ingresar con una cuenta suspendida", () => {
    vi.useFakeTimers();
    const ingresar = vi.fn();
    render(<Login onIngresar={ingresar} />);
    fireEvent.change(screen.getByLabelText("DNI"), { target: { value: "28999000" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "Suerte2026!" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    act(() => vi.runAllTimers());
    expect(ingresar).not.toHaveBeenCalled();
  });
});