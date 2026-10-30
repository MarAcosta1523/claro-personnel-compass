import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { cumplePolitica, type Rol, type Usuario } from "../data";
import { IconAlerta, IconCandado, IconCheck, IconCrearCuenta, IconConsultar, IconModificar, IconPerfil, IconSuspender } from "../icons";
import { Aviso, Boton, Buscador, Campo, Dialogo, Encabezado, Etiqueta, PieAcciones, Select, Vacio, inputG, tdCls, thCls } from "./ui";
import type { Notificar } from "./PanelGerente";
import { createAttemptTracker } from "../prototype";
import { Mensaje } from "../Mensaje";
import { PasswordInput } from "../PasswordInput";

type Modo = { t: "nada" } | { t: "ver"; id: number } | { t: "nuevo" } | { t: "editar"; id: number };
type Form = { nombre: string; apellido: string; dni: string; rol: Rol; pass: string; pass2: string };
const vacio: Form = { nombre: "", apellido: "", dni: "", rol: "Personal", pass: "", pass2: "" };

export function Usuarios({ usuarios, setUsuarios, notificar }: { usuarios: Usuario[]; setUsuarios: (u: Usuario[]) => void; notificar: Notificar }) {
  const [q, setQ] = useState("");
  const [fRol, setFRol] = useState("todos");
  const [fEstado, setFEstado] = useState("todos");
  const [modo, setModo] = useState<Modo>({ t: "nada" });
  const [suspender, setSuspender] = useState<Usuario | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [fallar] = useState(createAttemptTracker);
  const [errorOperacion, setErrorOperacion] = useState<string | null>(null);

  const lista = useMemo(() => {
    const s = q.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        (!s || `${u.nombre} ${u.apellido}`.toLowerCase().includes(s) || u.dni.includes(s)) &&
        (fRol === "todos" || u.rol === fRol) &&
        (fEstado === "todos" || u.estado === fEstado),
    );
  }, [usuarios, q, fRol, fEstado]);

  const sel = modo.t === "ver" || modo.t === "editar" ? usuarios.find((u) => u.id === modo.id) : undefined;

  const guardar = (f: Form) => {
    setErrorOperacion(null);
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      if (fallar(modo.t)) { setErrorOperacion("No se pudo guardar el usuario. Intentá de nuevo."); return; }
      if (modo.t === "nuevo") {
        const nuevo: Usuario = { id: Date.now(), nombre: f.nombre.trim(), apellido: f.apellido.trim(), dni: f.dni, rol: f.rol, estado: "activo" };
        setUsuarios([nuevo, ...usuarios]);
        setModo({ t: "ver", id: nuevo.id });
        notificar("exito", "El usuario fue registrado", `${nuevo.nombre} ${nuevo.apellido}.`);
      } else if (modo.t === "editar") {
        setUsuarios(usuarios.map((u) => (u.id === modo.id ? { ...u, nombre: f.nombre.trim(), apellido: f.apellido.trim(), dni: f.dni, rol: f.rol } : u)));
        setModo({ t: "ver", id: modo.id });
        notificar("exito", "El usuario fue modificado", `Se guardaron los cambios de ${f.nombre} ${f.apellido}.`);
      }
    }, 700);
  };

  const confirmarSuspension = () => {
    if (!suspender) return;
    setErrorOperacion(null);
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      if (fallar("suspender")) { setErrorOperacion("No se pudo suspender el usuario. Intentá de nuevo."); return; }
      setUsuarios(usuarios.map((u) => (u.id === suspender.id ? { ...u, estado: "suspendido" } : u)));
      notificar("exito", "El usuario fue suspendido", `${suspender.nombre} ${suspender.apellido}.`);
      setSuspender(null);
    }, 700);
  };

  return (
    <>
      <Encabezado
        icono={<IconPerfil size={28} />}
        titulo="Gestionar usuarios"
        acciones={<Boton variante="primario" icono={<IconCrearCuenta size={22} />} onClick={() => { setErrorOperacion(null); setModo({ t: "nuevo" }); }}>Registrar usuario</Boton>}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <section className="min-w-0 space-y-3">
          <div className="flex gap-3">
            <Buscador valor={q} onCambio={setQ} placeholder="Buscar por nombre, apellido o DNI" />
            <Select valor={fRol} onCambio={setFRol} opciones={[{ v: "todos", t: "Todos los roles" }, { v: "Gerente", t: "Gerente" }, { v: "Personal", t: "Personal" }]} />
            <Select valor={fEstado} onCambio={setFEstado} opciones={[{ v: "todos", t: "Todos los estados" }, { v: "activo", t: "Activos" }, { v: "suspendido", t: "Suspendidos" }]} />
          </div>
          <p className="text-sm text-muted-foreground">{lista.length} de {usuarios.length} usuarios</p>
          {lista.length === 0 ? (
            <Vacio icono={<IconPerfil size={40} />} titulo="No se encontraron usuarios" detalle="Probá con otro nombre o DNI, o cambiá los filtros." accion={<Boton onClick={() => { setQ(""); setFRol("todos"); setFEstado("todos"); }}>Limpiar búsqueda</Boton>} />
          ) : (
            <div className="max-h-[480px] overflow-auto rounded-xl border-2 bg-card">
              <table className="w-full">
                <thead><tr><th className={thCls}>Nombre y apellido</th><th className={thCls}>DNI</th><th className={thCls}>Rol</th><th className={thCls}>Estado</th><th className={thCls}>Acciones</th></tr></thead>
                <tbody>
                  {lista.map((u) => {
                    const activo = sel?.id === u.id;
                    return (
                      <tr key={u.id} onClick={() => { setErrorOperacion(null); setModo({ t: "ver", id: u.id }); }} aria-selected={activo}
                        className={cn("cursor-pointer border-t transition", activo ? "bg-accent outline-2 -outline-offset-2 outline-primary" : "hover:bg-muted", u.estado === "suspendido" && "text-muted-foreground")}>
                        <td className={cn(tdCls, "font-bold")}>{u.nombre} {u.apellido}</td>
                        <td className={cn(tdCls, "font-mono")}>{u.dni}</td>
                        <td className={tdCls}>{u.rol}</td>
                        <td className={tdCls}>{u.estado === "activo" ? <Etiqueta tono="activo" icono={<IconCheck size={14} />}>Activo</Etiqueta> : <Etiqueta tono="suspendido" icono={<IconCandado size={14} />}>Suspendido</Etiqueta>}</td>
                        <td className={tdCls}><div className="flex gap-1" onClick={(e) => e.stopPropagation()}><Boton title="Consultar" aria-label={`Consultar usuario ${u.nombre} ${u.apellido}`} className="h-10 w-10 px-0" onClick={() => { setErrorOperacion(null); setModo({ t: "ver", id: u.id }); }}><IconConsultar size={18} /></Boton><Boton title="Modificar" aria-label={`Modificar usuario ${u.nombre} ${u.apellido}`} className="h-10 w-10 px-0" onClick={() => { setErrorOperacion(null); setModo({ t: "editar", id: u.id }); }}><IconModificar size={18} /></Boton><Boton variante="peligro" title="Suspender" aria-label={`Suspender usuario ${u.nombre} ${u.apellido}`} className="h-10 w-10 px-0" onClick={() => { setErrorOperacion(null); if (u.estado === "suspendido") return notificar("error", "El usuario ya se encuentra suspendido"); setSuspender(u); }}><IconSuspender size={18} /></Boton></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-xl border-2 bg-card p-5">
          {errorOperacion && !suspender && <div className="mb-4"><Mensaje tipo="error" titulo={errorOperacion} onCerrar={() => setErrorOperacion(null)} /></div>}
          {modo.t === "nada" && <Vacio icono={<IconPerfil size={40} />} titulo="Elegí un usuario"  />}
          {modo.t === "ver" && sel && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Consultar usuario</p>
                <h2 className="mt-1 text-2xl font-bold">{sel.nombre} {sel.apellido}</h2>
              </div>
              <dl className="space-y-3 text-base">
                {[["DNI", <span className="font-mono">{sel.dni}</span>], ["Rol", sel.rol], ["Estado", sel.estado === "activo" ? <Etiqueta tono="activo" icono={<IconCheck size={14} />}>Activo</Etiqueta> : <Etiqueta tono="suspendido" icono={<IconCandado size={14} />}>Suspendido</Etiqueta>]].map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-bold">{v}</dd></div>
                ))}
              </dl>
              <div className="grid grid-cols-2 gap-3">
                <Boton icono={<IconModificar size={20} />} onClick={() => { setErrorOperacion(null); setModo({ t: "editar", id: sel.id }); }}>Modificar</Boton>
                <Boton variante="peligro" icono={<IconSuspender size={20} />} onClick={() => { setErrorOperacion(null); if (sel.estado === "suspendido") return notificar("error", "El usuario ya se encuentra suspendido"); setSuspender(sel); }}>Suspender</Boton>
              </div>
            </div>
          )}
          {(modo.t === "nuevo" || (modo.t === "editar" && sel)) && (
            <FormUsuario
              key={modo.t === "editar" ? modo.id : "nuevo"}
              inicial={sel && modo.t === "editar" ? { nombre: sel.nombre, apellido: sel.apellido, dni: sel.dni, rol: sel.rol, pass: "", pass2: "" } : vacio}
              editando={modo.t === "editar"}
              dnisOcupados={usuarios.filter((u) => u.id !== sel?.id || modo.t === "nuevo").map((u) => u.dni)}
              procesando={procesando}
              onCancelar={() => { setErrorOperacion(null); setModo(sel && modo.t === "editar" ? { t: "ver", id: sel.id } : { t: "nada" }); }}
              onGuardar={guardar}
            />
          )}
        </aside>
      </div>

      <Dialogo abierto={!!suspender} titulo="¿Suspender este usuario?" icono={<IconSuspender size={24} className="text-destructive" />} onCerrar={() => { if (!procesando) { setErrorOperacion(null); setSuspender(null); } }}>
        {suspender && (
          <div className="space-y-4">
            {errorOperacion && <Mensaje tipo="error" titulo={errorOperacion} onCerrar={() => setErrorOperacion(null)} />}
            <p className="text-base">Vas a suspender la cuenta de <b>{suspender.nombre} {suspender.apellido}</b> (DNI {suspender.dni}).</p>
            <PieAcciones onCancelar={() => { setErrorOperacion(null); setSuspender(null); }} onConfirmar={confirmarSuspension} textoConfirmar="Sí, suspender" peligro cargando={procesando} />
          </div>
        )}
      </Dialogo>
    </>
  );
}

function FormUsuario({ inicial, editando, dnisOcupados, procesando, onCancelar, onGuardar }: {
  inicial: Form; editando: boolean; dnisOcupados: string[]; procesando: boolean; onCancelar: () => void; onGuardar: (f: Form) => void;
}) {
  const [f, setF] = useState(inicial);
  const [errores, setErrores] = useState<Partial<Record<keyof Form, string>>>({});
  const set = (k: keyof Form, v: string) => { setF({ ...f, [k]: v }); setErrores({ ...errores, [k]: undefined }); };
  const cambiaPass = !editando || f.pass.length > 0;

  const validar = () => {
    const e: typeof errores = {};
    if (!f.nombre.trim()) e.nombre = "Completá el nombre.";
    else if (!/^[\p{L} '-]+$/u.test(f.nombre)) e.nombre = "Usá solo letras.";
    if (!f.apellido.trim()) e.apellido = "Completá el apellido.";
    else if (!/^[\p{L} '-]+$/u.test(f.apellido)) e.apellido = "Usá solo letras.";
    if (!f.dni) e.dni = "Completá el DNI.";
    else if (!/^\d{7,8}$/.test(f.dni)) e.dni = "El DNI va sin puntos, solo números (7 u 8).";
    else if (dnisOcupados.includes(f.dni)) e.dni = "El DNI ya está registrado.";
    if (cambiaPass) {
      if (!f.pass) e.pass = "Completá la contraseña.";
      else if (!cumplePolitica(f.pass)) e.pass = "Usá al menos 8 caracteres, mayúscula, minúscula, número y un símbolo (! @ # $ % & *), sin espacios.";
      if (f.pass && f.pass2 !== f.pass) e.pass2 = "Las contraseñas no coinciden.";
    }
    setErrores(e);
    if (Object.keys(e).length === 0) onGuardar(f);
  };
  const hayErrores = Object.values(errores).some(Boolean);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{editando ? "Modificar usuario" : "Registrar usuario"}</p>
        
      </div>
      {hayErrores && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border-2 border-destructive bg-destructive-soft px-3 py-2 text-[15px] font-bold text-destructive">
          <IconAlerta size={20} /> No se pudo guardar el usuario. Revisá los campos marcados.
        </div>
      )}
      <fieldset disabled={procesando} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Campo id="u-nombre" label="Nombre" requerido error={errores.nombre}><input id="u-nombre" value={f.nombre} onChange={(e) => set("nombre", e.target.value)} className={inputG(errores.nombre)} /></Campo>
          <Campo id="u-apellido" label="Apellido" requerido error={errores.apellido}><input id="u-apellido" value={f.apellido} onChange={(e) => set("apellido", e.target.value)} className={inputG(errores.apellido)} /></Campo>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo id="u-dni" label="DNI" requerido error={errores.dni} ayuda="Sin puntos"><input id="u-dni" inputMode="numeric" value={f.dni} onChange={(e) => set("dni", e.target.value.replace(/\D/g, "").slice(0, 8))} className={cn(inputG(errores.dni), "font-mono")} /></Campo>
          <Campo id="u-rol" label="Rol" requerido><Select id="u-rol" valor={f.rol} onCambio={(v) => set("rol", v)} ancho="w-full" opciones={[{ v: "Personal", t: "Personal" }, { v: "Gerente", t: "Gerente" }]} /></Campo>
        </div>
        <Campo id="u-pass" label={editando ? "Nueva contraseña" : "Contraseña"} requerido={!editando} error={errores.pass} ayuda={editando ? "Dejala vacía para no cambiarla." : undefined}>
          <PasswordInput id="u-pass" autoComplete="new-password" value={f.pass} onChange={(e) => set("pass", e.target.value)} className={inputG(errores.pass)} />
        </Campo>
        {cambiaPass && (
          <Campo id="u-pass2" label="Confirmá la contraseña" requerido error={errores.pass2}>
            <PasswordInput id="u-pass2" autoComplete="new-password" value={f.pass2} onChange={(e) => set("pass2", e.target.value)} className={inputG(errores.pass2)} />
          </Campo>
        )}
      </fieldset>
      <PieAcciones onCancelar={onCancelar} onConfirmar={validar} cargando={procesando} />
    </div>
  );
}
