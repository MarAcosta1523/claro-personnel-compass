import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { isoAFecha, type Ficha } from "../data";
import { IconAlerta, IconCandado, IconCheck, IconFicha, IconConsultar, IconMas, IconModificar, IconNota, IconSuspender } from "../icons";
import { Aviso, Boton, Buscador, Campo, Dialogo, Encabezado, Etiqueta, PieAcciones, Select, Vacio, inputG, tdCls, thCls } from "./ui";
import type { Notificar } from "./PanelGerente";
import { createAttemptTracker } from "../prototype";

type Modo = { t: "nada" } | { t: "ver"; id: number } | { t: "nuevo" } | { t: "editar"; id: number };
type Form = { nombre: string; apellido: string; dni: string; telefono: string; ingreso: string };



export function Fichas({ fichas, setFichas, notificar }: { fichas: Ficha[]; setFichas: (f: Ficha[]) => void; notificar: Notificar }) {
  const [q, setQ] = useState("");
  const [fEstado, setFEstado] = useState("todos");
  const [modo, setModo] = useState<Modo>({ t: "nada" });
  const [suspender, setSuspender] = useState<Ficha | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [fallar] = useState(createAttemptTracker);

  const lista = useMemo(() => {
    const s = q.trim().toLowerCase();
    return fichas.filter((f) => (!s || `${f.nombre} ${f.apellido}`.toLowerCase().includes(s) || f.dni.includes(s)) && (fEstado === "todos" || f.estado === fEstado));
  }, [fichas, q, fEstado]);
  const sel = modo.t === "ver" || modo.t === "editar" ? fichas.find((f) => f.id === modo.id) : undefined;

  const guardar = (d: Form) => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      if (fallar(modo.t)) { notificar("error", "No se pudo guardar la ficha", "Intentá de nuevo."); return; }
      if (modo.t === "nuevo") {
        const n: Ficha = { id: Date.now(), ...d, estado: "activa" };
        setFichas([n, ...fichas]);
        setModo({ t: "ver", id: n.id });
        notificar("exito", "La ficha fue registrada", `${n.nombre} ${n.apellido}.`);
      } else if (modo.t === "editar") {
        setFichas(fichas.map((f) => (f.id === modo.id ? { ...f, ...d } : f)));
        setModo({ t: "ver", id: modo.id });
        notificar("exito", "La ficha fue modificada", `Se guardaron los cambios de ${d.nombre} ${d.apellido}.`);
      }
    }, 700);
  };

  const confirmarSuspension = () => {
    if (!suspender) return;
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      if (fallar("suspender")) { notificar("error", "No se pudo suspender la ficha", "Intentá de nuevo."); setSuspender(null); return; }
      setFichas(fichas.map((f) => (f.id === suspender.id ? { ...f, estado: "suspendida" } : f)));
      notificar("exito", "La ficha fue suspendida", `${suspender.nombre} ${suspender.apellido}.`);
      setSuspender(null);
    }, 700);
  };

  const estadoTag = (f: Ficha) => f.estado === "activa"
    ? <Etiqueta tono="activo" icono={<IconCheck size={14} />}>Activa</Etiqueta>
    : <Etiqueta tono="suspendido" icono={<IconCandado size={14} />}>Suspendida</Etiqueta>;

  return (
    <>
      <Encabezado
        icono={<IconFicha size={28} />}
        titulo="Gestionar fichas de personal"
        acciones={<Boton variante="primario" icono={<IconMas size={22} />} onClick={() => setModo({ t: "nuevo" })}>Registrar ficha de personal</Boton>}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <section className="min-w-0 space-y-3">
          <div className="flex gap-3">
            <Buscador valor={q} onCambio={setQ} placeholder="Buscar por nombre, apellido o DNI" />
            <Select valor={fEstado} onCambio={setFEstado} opciones={[{ v: "todos", t: "Todos los estados" }, { v: "activa", t: "Activas" }, { v: "suspendida", t: "Suspendidas" }]} />
          </div>
          <p className="text-sm text-muted-foreground">{lista.length} de {fichas.length} fichas</p>
          {lista.length === 0 ? (
            <Vacio icono={<IconFicha size={40} />} titulo="No se encontraron fichas" detalle="Probá con otro nombre o DNI, o cambiá el filtro." accion={<Boton onClick={() => { setQ(""); setFEstado("todos"); }}>Limpiar búsqueda</Boton>} />
          ) : (
            <div className="max-h-[440px] overflow-auto rounded-xl border-2 bg-card">
              <table className="w-full">
                <thead><tr><th className={thCls}>Nombre y apellido</th><th className={thCls}>DNI</th><th className={thCls}>Estado</th><th className={thCls}>Acciones</th></tr></thead>
                <tbody>
                  {lista.map((f) => (
                    <tr key={f.id} onClick={() => setModo({ t: "ver", id: f.id })} aria-selected={sel?.id === f.id}
                      className={cn("cursor-pointer border-t", sel?.id === f.id ? "bg-accent outline-2 -outline-offset-2 outline-primary" : "hover:bg-muted", f.estado === "suspendida" && "text-muted-foreground")}>
                      <td className={cn(tdCls, "font-bold")}>{f.nombre} {f.apellido}</td>
                      <td className={cn(tdCls, "font-mono")}>{f.dni}</td>
                      <td className={tdCls}>{estadoTag(f)}</td>
                      <td className={tdCls}><div className="flex gap-1" onClick={(e) => e.stopPropagation()}><Boton title="Consultar" aria-label={`Consultar ficha ${f.nombre} ${f.apellido}`} className="h-10 w-10 px-0" onClick={() => setModo({ t: "ver", id: f.id })}><IconConsultar size={18} /></Boton><Boton title="Modificar" aria-label={`Modificar ficha ${f.nombre} ${f.apellido}`} className="h-10 w-10 px-0" onClick={() => setModo({ t: "editar", id: f.id })}><IconModificar size={18} /></Boton><Boton variante="peligro" title="Suspender" aria-label={`Suspender ficha ${f.nombre} ${f.apellido}`} className="h-10 w-10 px-0" disabled={f.estado === "suspendida"} onClick={() => setSuspender(f)}><IconSuspender size={18} /></Boton></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-xl border-2 bg-card p-5">
          {modo.t === "nada" && <Vacio icono={<IconFicha size={40} />} titulo="Elegí una ficha"  />}
          {modo.t === "ver" && sel && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Consultar ficha</p>
                <h2 className="mt-1 text-2xl font-bold">{sel.nombre} {sel.apellido}</h2>
              </div>
              <dl className="space-y-3 text-base">
                {[["DNI", <span className="font-mono">{sel.dni}</span>], ["Teléfono", sel.telefono || "—"], ["Fecha de ingreso", sel.ingreso ? isoAFecha(sel.ingreso) : "—"], ["Estado", estadoTag(sel)]].map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-bold">{v}</dd></div>
                ))}
              </dl>
              <div className="grid grid-cols-2 gap-3">
                <Boton icono={<IconModificar size={20} />} onClick={() => setModo({ t: "editar", id: sel.id })}>Modificar</Boton>
                <Boton variante="peligro" icono={<IconSuspender size={20} />} disabled={sel.estado === "suspendida"} onClick={() => setSuspender(sel)}>Suspender</Boton>
              </div>
            </div>
          )}
          {(modo.t === "nuevo" || (modo.t === "editar" && sel)) && (
            <FormFicha
              key={modo.t === "editar" ? modo.id : "nuevo"}
              inicial={sel && modo.t === "editar" ? { nombre: sel.nombre, apellido: sel.apellido, dni: sel.dni, telefono: sel.telefono, ingreso: sel.ingreso } : { nombre: "", apellido: "", dni: "", telefono: "", ingreso: "" }}
              editando={modo.t === "editar"}
              dnisOcupados={fichas.filter((f) => modo.t === "nuevo" || f.id !== sel?.id).map((f) => f.dni)}
              procesando={procesando}
              onCancelar={() => setModo(sel && modo.t === "editar" ? { t: "ver", id: sel.id } : { t: "nada" })}
              onGuardar={guardar}
            />
          )}
        </aside>
      </div>

      <Dialogo abierto={!!suspender} titulo="¿Suspender esta ficha?" icono={<IconSuspender size={24} className="text-destructive" />} onCerrar={() => !procesando && setSuspender(null)}>
        {suspender && (
          <div className="space-y-4">
            <p className="text-base">Vas a suspender la ficha de <b>{suspender.nombre} {suspender.apellido}</b> (DNI {suspender.dni}).</p>
            <PieAcciones onCancelar={() => setSuspender(null)} onConfirmar={confirmarSuspension} textoConfirmar="Sí, suspender" peligro cargando={procesando} />
          </div>
        )}
      </Dialogo>
    </>
  );
}

function FormFicha({ inicial, editando, dnisOcupados, procesando, onCancelar, onGuardar }: {
  inicial: Form; editando: boolean; dnisOcupados: string[]; procesando: boolean; onCancelar: () => void; onGuardar: (f: Form) => void;
}) {
  const [f, setF] = useState(inicial);
  const [e, setE] = useState<Partial<Record<keyof Form, string>>>({});
  const set = (k: keyof Form, v: string) => { setF({ ...f, [k]: v }); setE({ ...e, [k]: undefined }); };
  const validar = () => {
    const x: typeof e = {};
    if (!f.nombre.trim()) x.nombre = "Completá el nombre."; else if (!/^[\p{L} '-]+$/u.test(f.nombre)) x.nombre = "Usá solo letras.";
    if (!f.apellido.trim()) x.apellido = "Completá el apellido."; else if (!/^[\p{L} '-]+$/u.test(f.apellido)) x.apellido = "Usá solo letras.";
    if (!f.dni) x.dni = "Completá el DNI."; else if (!/^\d{7,8}$/.test(f.dni)) x.dni = "El DNI va sin puntos, solo números (7 u 8)."; else if (dnisOcupados.includes(f.dni)) x.dni = "El DNI ya está registrado.";
    if (f.telefono && !/^[\d\s-]{6,20}$/.test(f.telefono)) x.telefono = "Usá solo números, espacios o guiones.";
    setE(x);
    if (!Object.keys(x).length) onGuardar(f);
  };
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{editando ? "Modificar ficha" : "Registrar ficha"}</p>

      </div>
      {Object.values(e).some(Boolean) && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border-2 border-destructive bg-destructive-soft px-3 py-2 text-[15px] font-bold text-destructive"><IconAlerta size={20} /> No se pudo guardar la ficha. Revisá los campos marcados.</div>
      )}
      <fieldset disabled={procesando} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Campo id="f-nombre" label="Nombre" requerido error={e.nombre}><input id="f-nombre" value={f.nombre} onChange={(v) => set("nombre", v.target.value)} className={inputG(e.nombre)} /></Campo>
          <Campo id="f-apellido" label="Apellido" requerido error={e.apellido}><input id="f-apellido" value={f.apellido} onChange={(v) => set("apellido", v.target.value)} className={inputG(e.apellido)} /></Campo>
        </div>
        <Campo id="f-dni" label="DNI" requerido error={e.dni} ayuda="Sin puntos"><input id="f-dni" inputMode="numeric" value={f.dni} onChange={(v) => set("dni", v.target.value.replace(/\D/g, "").slice(0, 8))} className={cn(inputG(e.dni), "font-mono")} /></Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo id="f-tel" label="Teléfono" error={e.telefono}><input id="f-tel" value={f.telefono} onChange={(v) => set("telefono", v.target.value)} className={inputG(e.telefono)} /></Campo>
          <Campo id="f-ing" label="Fecha de ingreso"><input id="f-ing" type="date" value={f.ingreso} onChange={(v) => set("ingreso", v.target.value)} className={inputG()} /></Campo>
        </div>
      </fieldset>
      <PieAcciones onCancelar={onCancelar} onConfirmar={validar} cargando={procesando} />
    </div>
  );
}
