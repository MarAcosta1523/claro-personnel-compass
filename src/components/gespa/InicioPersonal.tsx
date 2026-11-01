import { useEffect, useState } from "react";
import logo from "@/assets/logo-gespa.png";
import { fmtCorta, fmtFecha, fmtHora, type Asistencia, type Cuenta, type Ficha, type Registro, type Tipo } from "./data";
import { crearAsistenciaPersonal, fichaVinculada } from "./asistencia-personal";
import { IconEntrada, IconHistorial, IconNota, IconPerfil, IconSalida } from "./icons";
import { Mensaje } from "./Mensaje";
import { cn } from "@/lib/utils";
import { Boton } from "./gerente/ui";

type Resultado = { tipo: "exito" | "error"; titulo: string; detalle: string } | null;

export function InicioPersonal({
  cuenta,
  fichas,
  asistencias,
  onRegistrar,
  onSalir,
}: {
  cuenta: Cuenta;
  fichas: Ficha[];
  asistencias: Asistencia[];
  onRegistrar: (r: Asistencia) => void;
  onSalir: () => void;
}) {
  const legajo = fichaVinculada(cuenta, fichas);
  const [ahora, setAhora] = useState<Date | null>(null);
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [obs, setObs] = useState("");
  const [ultimo, setUltimo] = useState<Registro | null>(() => {
    const r = asistencias
      .filter((a) => a.fichaId === cuenta.fichaId && !a.suspendida)
      .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`))[0];
    const guardado = r ? { tipo: r.tipo, fecha: new Date(`${r.fecha}T${r.hora}:00`) } : null;
    return guardado && (!cuenta.ultimo || guardado.fecha > cuenta.ultimo.fecha) ? guardado : cuenta.ultimo;
  });
  const [resultado, setResultado] = useState<Resultado>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    setAhora(new Date());
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const confirmar = () => {
    if (!tipo) return;
    setProcesando(true);
    setResultado(null);
    setTimeout(() => {
      setProcesando(false);
      if (!fichaVinculada(cuenta, fichas)) {
        setResultado({ tipo: "error", titulo: "No se pudo registrar la asistencia", detalle: "Consultá con el Gerente." });
        return;
      }
      if (ultimo && ultimo.tipo === tipo) {
        setResultado({
          tipo: "error",
          titulo: "No se pudo registrar",
          detalle:
            tipo === "entrada"
              ? "No se pudo registrar la entrada. Revisá el registro anterior."
              : "No se pudo registrar la salida. Revisá el registro anterior.",
        });
        return;
      }
      if (!ultimo && tipo === "salida") {
        setResultado({ tipo: "error", titulo: "No se pudo registrar", detalle: "No se pudo registrar la salida. Revisá el registro anterior." });
        return;
      }
      const nuevo = { tipo, fecha: new Date() };
      const registro = crearAsistenciaPersonal(cuenta, fichas, asistencias, tipo, obs, nuevo.fecha);
      onRegistrar(registro);
      setUltimo(nuevo);
      setResultado({
        tipo: "exito",
        titulo: "Asistencia registrada con éxito",
        detalle: `${tipo === "entrada" ? "Entrada" : "Salida"} a las ${fmtHora(nuevo.fecha)} del ${fmtCorta(nuevo.fecha)}.`,
      });
      setTipo(null);
      setObs("");
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between bg-topbar px-8 text-topbar-foreground">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Punto de la Suerte" className="h-10 w-auto" />
          <span className="text-lg font-bold">GESPA</span>
          <span className="text-base opacity-60">· Punto de la Suerte</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <IconPerfil size={22} />
            <div className="leading-tight">
              <p className="text-base font-bold">{cuenta.nombre}</p>
              <p className="text-sm opacity-70">
                Personal · Legajo <span className="font-mono font-bold">#{legajo ? legajo.id : cuenta.fichaId ?? "No disponible"}</span>
              </p>
            </div>
          </div>
          <Boton
            variante="fantasma"
            onClick={onSalir}
            className="flex h-11 bg-transparent text-topbar-foreground items-center gap-2 rounded-lg border-2 border-topbar-foreground/40 px-4 text-base font-bold hover:bg-topbar-foreground/10 focus-visible:outline-2 focus-visible:outline-topbar-foreground"
          >
            <IconSalida size={20} /> Cerrar sesión
          </Boton>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[1fr_340px] gap-8 px-8 py-8">
        <section className="space-y-6">
          <div>
            <p className="text-lg text-muted-foreground">Hola, {cuenta.nombre.split(" ")[0]}</p>
            <p className="font-mono text-6xl font-bold text-primary tabular-nums tracking-tight" aria-live="off">
              {ahora ? fmtHora(ahora, true) : "--:--:--"}
            </p>
            <p className="mt-1 text-xl first-letter:uppercase">{ahora ? fmtFecha(ahora) : "\u00a0"}</p>
          </div>

          {resultado && (
            <Mensaje tipo={resultado.tipo} titulo={resultado.titulo} detalle={resultado.detalle} onCerrar={() => setResultado(null)} />
          )}

          <fieldset disabled={procesando} className="space-y-6">
            <legend className="mb-1 flex items-center gap-2 text-lg font-bold">
              Registro de Asistencia
            </legend>
            <p className="text-sm text-muted-foreground">
              Paso 1: Seleccioná si vas a registrar tu entrada o tu salida para iniciar la vinculación automática con tu legajo.
            </p>

            <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Tipo de registro">
              <BotonGrande
                sel={tipo === "entrada"}
                onClick={() => setTipo("entrada")}
                icono={<IconEntrada size={40} />}
                titulo="Registrar entrada"
                sub="Al iniciar tu jornada"
              />
              <BotonGrande
                sel={tipo === "salida"}
                onClick={() => setTipo("salida")}
                icono={<IconSalida size={40} />}
                titulo="Registrar salida"
                sub="Al finalizar tu jornada"
              />
            </div>

            {/* Proceso automático de vinculación al seleccionar una opción */}
            {tipo && (
              <div className="space-y-5 rounded-xl border-2 border-border bg-card p-5 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3 rounded-lg border-2 border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Paso 2 · Vinculación automática confirmada
                      </span>
                    </div>
                    {legajo ? (
                      <>
                        <p className="text-base font-semibold text-foreground">
                          Cuenta asociada exitosamente a la ficha de Legajo #{legajo.id} ({legajo.nombre} {legajo.apellido})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          DNI: {legajo.dni} · Cargo: {legajo.cargo} · El registro quedará formalmente asignado a tu legajo.
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-semibold text-destructive">
                        No se encontró un legajo asociado a tu cuenta de usuario. Consultá con el Gerente.
                      </p>
                    )}
                  </div>
                </div>

                {/* Paso 3: Observación opcional y Confirmación */}
                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <label htmlFor="obs" className="flex items-center gap-2 text-base font-bold">
                      <IconNota size={20} /> Paso 3 · Observación <span className="font-normal text-muted-foreground">(opcional)</span>
                    </label>
                    <input
                      id="obs"
                      value={obs}
                      maxLength={120}
                      onChange={(e) => setObs(e.target.value)}
                      placeholder="Ej.: llegué tarde por un corte de colectivo, cambio de turno, etc."
                      className="h-12 w-full rounded-lg border-2 border-input bg-background px-4 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Boton
                      variante="primario"
                      onClick={confirmar}
                      disabled={!tipo || procesando || !legajo}
                      className="flex h-14 min-w-64 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-lg font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {procesando ? "Registrando…" : "Confirmar"}
                    </Boton>
                    <Boton
                      variante="fantasma"
                      type="button"
                      onClick={() => {
                        setTipo(null);
                        setObs("");
                      }}
                      disabled={procesando}
                      className="h-14 px-5 text-base font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Cancelar
                    </Boton>
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border-2 bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <IconHistorial size={22} /> Tu último registro
            </h2>
            {ultimo ? (
              <dl className="mt-4 space-y-3 text-base">
                <Fila k="Tipo">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 font-bold">
                    {ultimo.tipo === "entrada" ? <IconEntrada size={18} /> : <IconSalida size={18} />}
                    {ultimo.tipo === "entrada" ? "Entrada" : "Salida"}
                  </span>
                </Fila>
                <Fila k="Fecha">{fmtCorta(ultimo.fecha)}</Fila>
                <Fila k="Hora">
                  <span className="font-mono font-bold">{fmtHora(ultimo.fecha)}</span>
                </Fila>
              </dl>
            ) : (
              <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center">
                <p className="text-base font-bold">Todavía no tenés registros</p>
                <p className="mt-1 text-[15px] text-muted-foreground">Empezá registrando tu entrada.</p>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function BotonGrande({ sel, onClick, icono, titulo, sub }: { sel: boolean; onClick: () => void; icono: React.ReactNode; titulo: string; sub: string }) {
  return (
    <Boton
      type="button"
      role="radio"
      aria-checked={sel}
      onClick={onClick}
      className={cn(
        "relative flex h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 text-center transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
        sel ? "border-primary bg-accent text-primary shadow-lg" : "border-input bg-card hover:border-primary hover:bg-accent",
      )}
    >
      {sel && <span className="absolute right-3 top-3 rounded-md bg-primary-foreground px-2 py-0.5 text-sm font-bold text-primary">Elegido ✓</span>}
      {icono}
      <span className="text-2xl font-bold">{titulo}</span>
      <span className={cn("text-[15px]", sel ? "opacity-80" : "text-muted-foreground")}>{sub}</span>
    </Boton>
  );
}

function Fila({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}
