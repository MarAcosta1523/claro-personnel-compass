import { useState, type FormEvent } from "react";
import logo from "@/assets/logo-gespa.png";
import { CUENTAS, type Cuenta } from "./data";
import { IconEntrada } from "./icons";
import { Mensaje } from "./Mensaje";
import { PasswordInput } from "./PasswordInput";
import { Boton } from "./gerente/ui";

type Error = { tipo: "error" | "suspendida"; titulo: string; detalle: string } | null;

export function Login({ onIngresar }: { onIngresar: (c: Cuenta) => void }) {
  const [dni, setDni] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<Error>(null);
  const [campos, setCampos] = useState<{ dni?: string; pass?: string }>({});
  const [cargando, setCargando] = useState(false);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const c: typeof campos = {};
    if (!dni.trim()) c.dni = "Ingresá tu DNI.";
    else if (!/^\d{7,8}$/.test(dni.trim())) c.dni = "El DNI va sin puntos, solo números (7 u 8).";
    if (!pass) c.pass = "Ingresá tu contraseña.";
    setCampos(c);
    setError(null);
    if (Object.keys(c).length) return;
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      const cuenta = CUENTAS.find((x) => x.dni === dni.trim());
      if (!cuenta || cuenta.password !== pass) {
        setPass("");
        setError({ tipo: "error", titulo: "DNI o contraseña incorrectos", detalle: "Revisá los datos e intentá de nuevo." });
        return;
      }
      if (cuenta.suspendida) {
        setPass("");
        setError({ tipo: "suspendida", titulo: "Tu cuenta está suspendida", detalle: "No podés ingresar. Consultá con el Gerente." });
        return;
      }
      onIngresar(cuenta);
    }, 700);
  };

  return (
    <div className="grid min-h-screen grid-cols-[minmax(420px,5fr)_7fr]">
      <aside className="relative flex flex-col bg-topbar p-12 text-topbar-foreground">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-12 w-auto" />
          <span className="text-lg font-bold">Punto de la Suerte</span>
        </div>
        <div className="my-auto py-12">
          <img src={logo} alt="Logo de Punto de la Suerte" className="mb-8 h-40 w-auto" />
          <h1 className="text-5xl font-bold tracking-tight">GESPA</h1>
          
        </div>
        
      </aside>

      <main className="flex items-center justify-center p-12">
        <form onSubmit={enviar} noValidate className="w-full max-w-md space-y-6" aria-busy={cargando}>
          <div>
            <h2 className="text-3xl font-bold text-primary">Iniciar sesión</h2>
            
          </div>

          {error && <Mensaje tipo={error.tipo} titulo={error.titulo} detalle={error.detalle} onCerrar={() => setError(null)} />}

          <Campo id="dni" label="DNI" error={campos.dni}>
            <input
              id="dni"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
              aria-invalid={!!campos.dni}
              aria-describedby="dni-msg"
              disabled={cargando}
              className={inputCls(!!campos.dni)}
            />
          </Campo>

          <Campo id="pass" label="Contraseña" error={campos.pass}>
            <PasswordInput
              id="pass"
              autoComplete="off"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              aria-invalid={!!campos.pass}
              aria-describedby="pass-msg"
              disabled={cargando}
              className={inputCls(!!campos.pass)}
            />
          </Campo>

          <Boton
            variante="primario"
            type="submit"
            disabled={cargando}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-primary text-lg font-bold text-primary-foreground transition hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60"
          >
            <IconEntrada />
            {cargando ? "Ingresando…" : "Iniciar sesión"}
          </Boton>

          
        </form>
      </main>
    </div>
  );
}

export const inputCls = (err: boolean) =>
  `h-14 w-full rounded-lg border-2 bg-card px-4 text-lg outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:opacity-60 ${
    err ? "border-destructive" : "border-input"
  }`;

function Campo({ id, label, ayuda, error, children }: { id: string; label: string; ayuda?: string | undefined; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-base font-bold">{label}</label>
      {children}
      <p id={`${id}-msg`} className={`text-[15px] ${error ? "font-bold text-destructive" : "text-muted-foreground"}`}>
        {error ? `⚠ ${error}` : ayuda}
      </p>
    </div>
  );
}
