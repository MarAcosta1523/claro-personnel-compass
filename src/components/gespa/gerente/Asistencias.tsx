import { useState } from "react";
import { cn } from "@/lib/utils";
import { ahoraIso, analizar, fmtHoras, isoAFecha, type Asistencia, type Correccion, type Ficha, type Tipo } from "../data";
import { IconAlerta, IconCalendario, IconConsultar, IconEntrada, IconHistorial, IconModificar, IconSalida, IconSuspender } from "../icons";
import { Aviso, Boton, Campo, Dialogo, Encabezado, Etiqueta, PieAcciones, Select, Spinner, Vacio, inputG, tdCls, thCls } from "./ui";
import type { Notificar } from "./PanelGerente";
import { createAttemptTracker } from "../prototype";
import { Mensaje } from "../Mensaje";

type Props = {
  fichas: Ficha[]; asistencias: Asistencia[]; setAsistencias: (a: Asistencia[]) => void;
  correcciones: Correccion[]; setCorrecciones: (c: Correccion[]) => void; gerente: string; notificar: Notificar;
};

export function Asistencias({ fichas, asistencias, setAsistencias, correcciones, setCorrecciones, gerente, notificar }: Props) {
  const [persona, setPersona] = useState("todas");
  const [desde, setDesde] = useState("2026-10-13");
  const [hasta, setHasta] = useState("2026-10-19");
  const [errorFiltro, setErrorFiltro] = useState("");
  const [consulta, setConsulta] = useState<{ persona: string; desde: string; hasta: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [editar, setEditar] = useState<Asistencia | null>(null);
  const [suspender, setSuspender] = useState<Asistencia | null>(null);
  const [verHistorial, setVerHistorial] = useState(false);
  const [completar, setCompletar] = useState<Asistencia | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [fallar] = useState(createAttemptTracker);
  const [errorOperacion, setErrorOperacion] = useState<string | null>(null);

  const consultar = () => {
    if (!desde || !hasta) return setErrorFiltro("Completá las dos fechas del período.");
    if (desde > hasta) return setErrorFiltro("La fecha «Desde» no puede ser posterior a «Hasta».");
    setErrorFiltro("");
    setCargando(true);
    setTimeout(() => { setCargando(false); setConsulta({ persona, desde, hasta }); }, 600);
  };

  const regs = consulta
    ? asistencias
        .filter((a) => (consulta.persona === "todas" || a.fichaId === Number(consulta.persona)) && a.fecha >= consulta.desde && a.fecha <= consulta.hasta)
        .sort((x, y) => (x.fecha + x.hora).localeCompare(y.fecha + y.hora))
    : [];
  const { incompletos, minutos } = analizar(regs);
  const nombre = (id: number) => { const f = fichas.find((x) => x.id === id); return f ? `${f.nombre} ${f.apellido}` : "—"; };
  const idsVisibles = new Set(regs.map((r) => r.id));
  const histVisible = correcciones.filter((c) => idsVisibles.has(c.asistenciaId));

  const guardarEdicion = (nuevo: Asistencia) => {
    if (!editar) return;
    setErrorOperacion(null);
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      if (fallar("modificar")) { setErrorOperacion("No se pudo modificar la asistencia. Intentá de nuevo."); return; }
      const cambios: Correccion[] = [];
      const cuando = ahoraIso();
      const campos: [keyof Asistencia, string][] = [["fecha", "Fecha"], ["hora", "Hora"], ["tipo", "Tipo de marca"], ["observacion", "Observación"]];
      for (const [k, t] of campos) {
        if (editar[k] !== nuevo[k]) cambios.push({ id: Date.now() + cambios.length, asistenciaId: editar.id, dato: t, anterior: String(editar[k] ?? ""), nuevo: String(nuevo[k] ?? ""), cuando, gerente });
      }
      setAsistencias(asistencias.map((a) => (a.id === editar.id ? nuevo : a)));
      setCorrecciones([...cambios, ...correcciones]);
      notificar("exito", "La asistencia fue modificada", "Se guardaron los cambios.");
      setEditar(null);
    }, 700);
  };

  const guardarCompletar = (nuevo: Asistencia) => {
    setErrorOperacion(null);
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      if (fallar("completar")) { setErrorOperacion("No se pudo completar el registro. Intentá de nuevo."); return; }
      const id = Math.max(0, ...asistencias.map((a) => a.id)) + 1;
      const reg = { ...nuevo, id };
      setAsistencias([...asistencias, reg]);
      setCorrecciones([{ id: Date.now(), asistenciaId: id, dato: "Marca agregada", anterior: "", nuevo: `${reg.tipo === "entrada" ? "Entrada" : "Salida"} ${reg.hora}`, cuando: ahoraIso(), gerente }, ...correcciones]);
      notificar("exito", "El registro quedó completo", `Se agregó la ${reg.tipo} de las ${reg.hora}.`);
      setCompletar(null);
    }, 700);
  };

  const confirmarSuspension = () => {
    if (!suspender) return;
    setErrorOperacion(null);
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      if (fallar("suspender")) { setErrorOperacion("No se pudo suspender la asistencia. Intentá de nuevo."); return; }
      setAsistencias(asistencias.map((a) => (a.id === suspender.id ? { ...a, suspendida: true } : a)));
      setCorrecciones([{ id: Date.now(), asistenciaId: suspender.id, dato: "Estado", anterior: "Vigente", nuevo: "Suspendido", cuando: ahoraIso(), gerente }, ...correcciones]);
      notificar("exito", "La asistencia fue suspendida");
      setSuspender(null);
    }, 700);
  };

  return (
    <>
      <Encabezado icono={<IconCalendario size={28} />} titulo="Gestionar asistencias" />

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border-2 bg-card p-4">
        <Campo id="a-persona" label="Persona">
          <Select id="a-persona" valor={persona} onCambio={setPersona} ancho="w-64" opciones={[{ v: "todas", t: "Todas las fichas" }, ...fichas.map((f) => ({ v: String(f.id), t: `${f.nombre} ${f.apellido}${f.estado === "suspendida" ? " (suspendida)" : ""}` }))]} />
        </Campo>
        <Campo id="a-desde" label="Desde"><input id="a-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={cn(inputG(!!errorFiltro), "w-44")} /></Campo>
        <Campo id="a-hasta" label="Hasta"><input id="a-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={cn(inputG(!!errorFiltro), "w-44")} /></Campo>
        <Boton variante="primario" icono={<IconConsultar size={22} />} onClick={consultar} cargando={cargando} className="min-w-40">{cargando ? "Consultando…" : "Consultar"}</Boton>
        {errorFiltro && <p role="alert" className="w-full text-[15px] font-bold text-destructive">⚠ {errorFiltro}</p>}
      </div>

      {cargando ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border-2 bg-card py-16 text-lg" aria-live="polite"><Spinner /> Buscando registros…</div>
      ) : !consulta ? (
        <Vacio icono={<IconConsultar size={40} />} titulo="Elegí una persona y un período"  />
      ) : regs.length === 0 ? (
        <Vacio icono={<IconCalendario size={40} />} titulo="No se encontraron registros para la persona y el período seleccionados" detalle="Probá con otro período o con «Todas las fichas»." />
      ) : (
        <div className="grid grid-cols-[1fr_220px] gap-5">
          <div className="min-w-0 space-y-3">
            {incompletos.size > 0 && (
              <Aviso tono="aviso" icono={<IconAlerta size={18} />}>
                <b>{incompletos.size} {incompletos.size === 1 ? "registro incompleto" : "registros incompletos"}</b>
              </Aviso>
            )}
            <div className="max-h-[400px] overflow-auto rounded-xl border-2 bg-card">
              <table className="w-full">
                <thead><tr>{consulta.persona === "todas" && <th className={thCls}>Persona</th>}<th className={thCls}>Fecha</th><th className={thCls}>Hora</th><th className={thCls}>Tipo</th><th className={thCls}>Observación</th><th className={thCls}>Estado</th><th className={cn(thCls, "text-right")}>Acciones</th></tr></thead>
                <tbody>
                  {regs.map((r) => {
                    const inc = incompletos.has(r.id);
                    return (
                      <tr key={r.id} className={cn("border-t", inc && "border-l-4 border-l-warning bg-warning-soft", r.suspendida && "text-muted-foreground line-through decoration-1")}>
                        {consulta.persona === "todas" && <td className={cn(tdCls, "font-bold")}>{nombre(r.fichaId)}</td>}
                        <td className={tdCls}>{isoAFecha(r.fecha)}</td>
                        <td className={cn(tdCls, "font-mono font-bold")}>{r.hora}</td>
                        <td className={tdCls}><span className="inline-flex items-center gap-1.5">{r.tipo === "entrada" ? <IconEntrada size={18} /> : <IconSalida size={18} />}{r.tipo === "entrada" ? "Entrada" : "Salida"}</span></td>
                        <td className={cn(tdCls, "max-w-52 truncate")} title={r.observacion}>{r.observacion || <span className="text-muted-foreground">—</span>}</td>
                        <td className={cn(tdCls, "no-underline")}>
                          {r.suspendida ? <Etiqueta tono="suspendido" icono={<IconSuspender size={14} />}>Suspendido</Etiqueta>
                            : inc ? <Etiqueta tono="aviso" icono={<IconAlerta size={14} />}>Incompleto</Etiqueta>
                            : <Etiqueta tono="neutro">Completo</Etiqueta>}
                        </td>
                        <td className={cn(tdCls, "text-right")}>
                          <div className="inline-flex gap-1">
                            {inc && !r.suspendida && <Boton variante="primario" onClick={() => { setErrorOperacion(null); setCompletar(r); }} aria-label={`Completar registro del ${isoAFecha(r.fecha)} ${r.hora}`} className="h-10 px-2.5 text-sm">{r.tipo === "entrada" ? <IconSalida size={18} /> : <IconEntrada size={18} />}Completar</Boton>}
                            <Boton disabled={r.suspendida} onClick={() => { setErrorOperacion(null); setEditar(r); }} title="Modificar" aria-label={`Modificar registro del ${isoAFecha(r.fecha)} ${r.hora}`} className="inline-flex h-10 items-center gap-1.5 rounded-md border-2 border-input bg-card px-2.5 text-sm font-bold hover:border-primary disabled:opacity-30"><IconModificar size={18} />Modificar</Boton>
                            <Boton onClick={() => { setErrorOperacion(null); if (r.suspendida) return notificar("error", "El registro ya se encuentra suspendido"); setSuspender(r); }} title="Suspender" aria-label={`Suspender registro del ${isoAFecha(r.fecha)} ${r.hora}`} className="inline-flex h-10 w-10 px-0 items-center justify-center rounded-md border-2 border-input bg-card text-destructive hover:border-destructive disabled:opacity-30"><IconSuspender size={18} /></Boton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-xl bg-primary p-5 text-primary-foreground">
              <p className="text-[15px] opacity-80">Total de horas trabajadas</p>
              <p className="mt-1 font-mono text-3xl font-bold">{fmtHoras(minutos)}</p>
              <p className="mt-2 text-sm opacity-80">{isoAFecha(consulta.desde)} al {isoAFecha(consulta.hasta)} · {consulta.persona === "todas" ? "Todas las fichas" : nombre(Number(consulta.persona))}</p>
            </div>
            
            <Boton className="w-full" icono={<IconHistorial size={20} />} onClick={() => setVerHistorial(true)}>Ver historial de correcciones</Boton>
          </aside>
        </div>
      )}

      <Dialogo abierto={!!editar} titulo="Modificar asistencia" icono={<IconModificar size={24} />} onCerrar={() => !procesando && setEditar(null)}>
        {errorOperacion && <div className="mb-4"><Mensaje tipo="error" titulo={errorOperacion} onCerrar={() => setErrorOperacion(null)} /></div>}
        {editar && <FormAsistencia key={editar.id} inicial={editar} persona={nombre(editar.fichaId)} otros={asistencias.filter((a) => a.fichaId === editar.fichaId && a.id !== editar.id && !a.suspendida)} procesando={procesando} onCancelar={() => setEditar(null)} onGuardar={guardarEdicion} />}
      </Dialogo>

      <Dialogo abierto={!!completar} titulo="Completar registro" icono={<IconModificar size={24} />} onCerrar={() => !procesando && setCompletar(null)}>
        {errorOperacion && <div className="mb-4"><Mensaje tipo="error" titulo={errorOperacion} onCerrar={() => setErrorOperacion(null)} /></div>}
        {completar && <FormCompletar key={completar.id} base={completar} persona={nombre(completar.fichaId)} otros={asistencias.filter((a) => a.fichaId === completar.fichaId && a.fecha === completar.fecha && !a.suspendida)} procesando={procesando} onCancelar={() => setCompletar(null)} onGuardar={guardarCompletar} />}
      </Dialogo>

      <Dialogo abierto={!!suspender} titulo="¿Suspender este registro?" icono={<IconSuspender size={24} className="text-destructive" />} onCerrar={() => !procesando && setSuspender(null)}>
        {suspender && (
          <div className="space-y-4">
            {errorOperacion && <Mensaje tipo="error" titulo={errorOperacion} onCerrar={() => setErrorOperacion(null)} />}
            <p className="text-base"><b>{nombre(suspender.fichaId)}</b> · {suspender.tipo === "entrada" ? "Entrada" : "Salida"} del {isoAFecha(suspender.fecha)} a las {suspender.hora}.</p>
            <PieAcciones onCancelar={() => setSuspender(null)} onConfirmar={confirmarSuspension} textoConfirmar="Sí, suspender" peligro cargando={procesando} />
          </div>
        )}
      </Dialogo>

      <Dialogo abierto={verHistorial} titulo="Historial de correcciones" icono={<IconHistorial size={24} />} onCerrar={() => setVerHistorial(false)} ancho="max-w-4xl">
        {histVisible.length === 0 ? (
          <Vacio icono={<IconHistorial size={40} />} titulo="No hay historial de correcciones"  />
        ) : (
          <div className="max-h-[420px] overflow-auto rounded-xl border-2">
            <table className="w-full">
              <thead><tr><th className={thCls}>Registro</th><th className={thCls}>Dato modificado</th><th className={thCls}>Valor anterior</th><th className={thCls}>Valor nuevo</th><th className={thCls}>Fecha y hora</th><th className={thCls}>Gerente</th></tr></thead>
              <tbody>
                {histVisible.map((c) => {
                  const r = asistencias.find((a) => a.id === c.asistenciaId);
                  return (
                    <tr key={c.id} className="border-t">
                      <td className={tdCls}>{r ? `${nombre(r.fichaId)} · ${isoAFecha(r.fecha)} ${r.hora} · ${r.tipo === "entrada" ? "Entrada" : "Salida"}` : "—"}</td>
                      <td className={cn(tdCls, "font-bold")}>{c.dato}</td>
                      <td className={tdCls}>{(c.dato === "Tipo de marca" ? (c.anterior === "entrada" ? "Entrada" : "Salida") : c.anterior) || <span className="text-muted-foreground">(vacío)</span>}</td>
                      <td className={cn(tdCls, "font-bold")}>{(c.dato === "Tipo de marca" ? (c.nuevo === "entrada" ? "Entrada" : "Salida") : c.nuevo) || <span className="text-muted-foreground">(vacío)</span>}</td>
                      <td className={cn(tdCls, "font-mono")}>{isoAFecha(c.cuando.slice(0, 10))} {c.cuando.slice(11)}</td>
                      <td className={tdCls}>{c.gerente}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Dialogo>
    </>
  );
}

function FormAsistencia({ inicial, persona, otros, procesando, onCancelar, onGuardar }: {
  inicial: Asistencia; persona: string; otros: Asistencia[]; procesando: boolean; onCancelar: () => void; onGuardar: (a: Asistencia) => void;
}) {
  const [f, setF] = useState(inicial);
  const [e, setE] = useState<{ fecha?: string; hora?: string; general?: string }>({});
  const validar = () => {
    const x: typeof e = {};
    if (!f.fecha) x.fecha = "Completá la fecha.";
    else if (f.fecha > new Date().toISOString().slice(0, 10)) x.fecha = "La fecha no puede ser futura.";
    if (!f.hora) x.hora = "Completá la hora.";
    else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.hora)) x.hora = "Usá el formato HH:MM, por ejemplo 08:30.";
    if (!x.fecha && !x.hora) {
      const dia = [...otros.filter((o) => o.fecha === f.fecha), f].sort((a, b) => a.hora.localeCompare(b.hora));
      const i = dia.indexOf(f);
      const prev = dia[i - 1], next = dia[i + 1];
      if ((prev && prev.hora === f.hora) || (next && next.hora === f.hora)) x.general = "Ya hay otro registro a esa misma hora ese día.";
      else if (f.tipo === "salida" && prev?.tipo === "salida") x.general = "No se pudo modificar la salida. Revisá el registro anterior.";
      else if (f.tipo === "salida" && !prev && next?.tipo === "entrada") x.general = "La salida no puede ser anterior a la entrada.";
      else if (f.tipo === "entrada" && next?.tipo === "entrada") x.general = "No se pudo modificar la entrada. Revisá el registro siguiente.";
    }
    setE(x);
    if (!Object.keys(x).length) onGuardar(f);
  };
  return (
    <div className="space-y-4">
      <p className="text-base">Registro de <b>{persona}</b></p>
      {(e.general || e.fecha || e.hora) && <div role="alert" className="flex items-start gap-2 rounded-lg border-2 border-destructive bg-destructive-soft px-3 py-2 text-[15px] font-bold text-destructive"><IconAlerta size={20} className="shrink-0" />{e.general || e.fecha || e.hora}</div>}
      <fieldset disabled={procesando} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Campo id="m-fecha" label="Fecha" requerido error={e.fecha}><input id="m-fecha" type="date" value={f.fecha} onChange={(v) => { setF({ ...f, fecha: v.target.value }); setE({}); }} className={inputG(e.fecha)} /></Campo>
          <Campo id="m-hora" label="Hora" requerido error={e.hora} ayuda="Formato 24 h, ej.: 08:30"><input id="m-hora" value={f.hora} placeholder="HH:MM" onChange={(v) => { setF({ ...f, hora: v.target.value }); setE({}); }} className={cn(inputG(e.hora), "font-mono")} /></Campo>
        </div>
        <div className="space-y-1.5">
          <p className="text-[15px] font-bold">Tipo de marca</p>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
            {(["entrada", "salida"] as Tipo[]).map((t) => (
              <Boton key={t} role="radio" aria-checked={f.tipo === t} onClick={() => { setF({ ...f, tipo: t }); setE({}); }}
                className={cn("flex h-12 items-center justify-center gap-2 rounded-lg border-2 text-base font-bold", f.tipo === t ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:border-primary")}>
                {t === "entrada" ? <IconEntrada size={20} /> : <IconSalida size={20} />}{t === "entrada" ? "Entrada" : "Salida"}
              </Boton>
            ))}
          </div>
        </div>
        <Campo id="m-obs" label="Observación"><input id="m-obs" value={f.observacion} maxLength={120} onChange={(v) => setF({ ...f, observacion: v.target.value })} className={inputG()} /></Campo>
      </fieldset>
      
      <PieAcciones onCancelar={onCancelar} onConfirmar={validar} cargando={procesando} />
    </div>
  );
}

function FormCompletar({ base, persona, otros, procesando, onCancelar, onGuardar }: {
  base: Asistencia; persona: string; otros: Asistencia[]; procesando: boolean; onCancelar: () => void; onGuardar: (a: Asistencia) => void;
}) {
  const tipo: Tipo = base.tipo === "entrada" ? "salida" : "entrada";
  const [hora, setHora] = useState("");
  const [obs, setObs] = useState("");
  const [error, setError] = useState("");
  const validar = () => {
    if (!hora) return setError("Completá la hora.");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) return setError("Usá el formato HH:MM, por ejemplo 14:00.");
    if (otros.some((o) => o.hora === hora)) return setError("Ya hay otro registro a esa misma hora ese día.");
    if (tipo === "salida" && hora <= base.hora) return setError(`La salida debe ser posterior a la entrada de las ${base.hora}.`);
    if (tipo === "entrada" && hora >= base.hora) return setError(`La entrada debe ser anterior a la salida de las ${base.hora}.`);
    const nuevo: Asistencia = { id: 0, fichaId: base.fichaId, fecha: base.fecha, hora, tipo, observacion: obs.trim() };
    const { incompletos } = analizar([...otros, nuevo]);
    if (incompletos.has(base.id) || incompletos.has(0)) return setError("Con esa hora el registro sigue incompleto. Revisá los registros del día.");
    setError("");
    onGuardar(nuevo);
  };
  const etiqueta = tipo === "salida" ? "Hora de salida" : "Hora de entrada";
  return (
    <div className="space-y-4">
      <p className="text-base"><b>{persona}</b> · {base.tipo === "entrada" ? "Entrada" : "Salida"} del {isoAFecha(base.fecha)} a las {base.hora}</p>
      {error && <div role="alert" className="flex items-start gap-2 rounded-lg border-2 border-destructive bg-destructive-soft px-3 py-2 text-[15px] font-bold text-destructive"><IconAlerta size={20} className="shrink-0" />{error}</div>}
      <fieldset disabled={procesando} className="space-y-4">
        <Campo id="c-hora" label={etiqueta} requerido ayuda="Formato 24 h, ej.: 14:00"><input id="c-hora" value={hora} placeholder="HH:MM" onChange={(v) => { setHora(v.target.value); setError(""); }} className={cn(inputG(error), "font-mono")} /></Campo>
        <Campo id="c-obs" label="Observación"><input id="c-obs" value={obs} maxLength={120} onChange={(v) => setObs(v.target.value)} className={inputG()} /></Campo>
      </fieldset>
      <PieAcciones onCancelar={onCancelar} onConfirmar={validar} cargando={procesando} />
    </div>
  );
}
