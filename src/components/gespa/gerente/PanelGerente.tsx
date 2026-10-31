import { useState, type ReactNode } from "react";
import logo from "@/assets/logo-gespa.png";
import { cn } from "@/lib/utils";
import { COPIAS, CORRECCIONES, analizar, isoAFecha, type Asistencia, type Cuenta, type Ficha, type Usuario } from "../data";
import { IconAlerta, IconCalendario, IconCopia, IconFicha, IconInicio, IconPerfil, IconSalida } from "../icons";
import { Mensaje } from "../Mensaje";
import { Usuarios } from "./Usuarios";
import { Fichas } from "./Fichas";
import { Asistencias } from "./Asistencias";
import { Copias } from "./Copias";
import { Boton } from "./ui";

export type Notificar = (tipo: "exito" | "error", titulo: string, detalle?: string) => void;
type Seccion = "inicio" | "usuarios" | "fichas" | "asistencias" | "copias";

const MENU: { id: Seccion; t: string; icono: (s: number) => ReactNode }[] = [
  { id: "usuarios", t: "Gestionar usuarios", icono: (s) => <IconPerfil size={s} /> },
  { id: "fichas", t: "Gestionar Personal", icono: (s) => <IconFicha size={s} /> },
  { id: "asistencias", t: "Gestionar asistencias", icono: (s) => <IconCalendario size={s} /> },
  { id: "copias", t: "Copias de seguridad", icono: (s) => <IconCopia size={s} /> },
];

export function PanelGerente({ cuenta, onSalir, usuarios, setUsuarios, fichas, setFichas, asistencias, setAsistencias }: {
  cuenta: Cuenta; onSalir: () => void;
  usuarios: Usuario[]; setUsuarios: (u: Usuario[]) => void;
  fichas: Ficha[]; setFichas: (f: Ficha[]) => void;
  asistencias: Asistencia[]; setAsistencias: (a: Asistencia[]) => void;
}) {
  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [correcciones, setCorrecciones] = useState(CORRECCIONES);
  const [copias, setCopias] = useState(COPIAS);
  const [msg, setMsg] = useState<{ tipo: "exito" | "error"; titulo: string; detalle?: string | undefined } | null>(null);

  const notificar: Notificar = (tipo, titulo, detalle) => setMsg({ tipo, titulo, detalle });
  const ir = (s: Seccion) => { setSeccion(s); setMsg(null); };
  const pendientes = analizar(asistencias).incompletos.size;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between bg-topbar px-6 text-topbar-foreground">
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
              <p className="text-sm opacity-70">Gerente</p>
            </div>
          </div>
          <Boton variante="fantasma" onClick={onSalir} className="flex h-11 bg-transparent text-topbar-foreground items-center gap-2 rounded-lg border-2 border-topbar-foreground/40 px-4 text-base font-bold hover:bg-topbar-foreground/10">
            <IconSalida size={20} /> Cerrar sesión
          </Boton>
        </div>
      </header>

      <div className="flex flex-1">
        <nav aria-label="Menú principal" className="flex w-56 shrink-0 flex-col gap-1 border-r-2 bg-card p-3">
          <ItemMenu activo={seccion === "inicio"} onClick={() => ir("inicio")} icono={<IconInicio size={22} />}>Inicio</ItemMenu>
          <p className="mt-3 px-3 pb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">Gestión</p>
          {MENU.map((m) => (
            <ItemMenu key={m.id} activo={seccion === m.id} onClick={() => ir(m.id)} icono={m.icono(22)}>
              {m.t}
              {m.id === "asistencias" && pendientes > 0 && <span className="ml-auto rounded-md bg-warning-soft px-1.5 text-sm font-bold text-warning" aria-label={`${pendientes} pendientes`}>{pendientes}</span>}
            </ItemMenu>
          ))}
          <div className="mt-auto border-t-2 pt-2">
            <ItemMenu activo={false} onClick={onSalir} icono={<IconSalida size={22} />}>Cerrar sesión</ItemMenu>
          </div>
        </nav>

        <main className="min-w-0 flex-1 px-6 py-6">
          {msg && <div className="mb-5"><Mensaje tipo={msg.tipo} titulo={msg.titulo} detalle={msg.detalle} onCerrar={() => setMsg(null)} /></div>}
          {seccion === "inicio" && (
            <div className="space-y-6">
              <div>
                <p className="text-lg text-muted-foreground">Hola, {cuenta.nombre.split(" ")[0]}</p>
                <h1 className="text-3xl font-bold text-primary">¿Qué querés hacer?</h1>
              </div>
              {pendientes > 0 && (
                <Boton onClick={() => ir("asistencias")} className="flex h-auto w-full items-center gap-3 rounded-xl border-2 border-warning/50 bg-warning-soft p-4 text-left hover:border-warning">
                  <IconAlerta size={24} className="text-warning" />
                  <span className="flex-1 text-base"><b>{pendientes} registros de asistencia requieren modificación.</b></span>
                  <span className="font-bold underline underline-offset-4">Revisar</span>
                </Boton>
              )}
              <div className="grid grid-cols-2 gap-4">
                {MENU.map((m) => (
                  <Boton key={m.id} onClick={() => ir(m.id)} className="group h-auto justify-start flex items-start gap-4 rounded-xl border-2 bg-card p-6 text-left transition hover:border-primary hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    <span className="rounded-lg bg-secondary p-3 transition group-hover:bg-primary group-hover:text-primary-foreground">{m.icono(32)}</span>
                    <span>
                      <span className="block text-xl font-bold">{m.t}</span>

                    </span>
                  </Boton>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Última copia de seguridad: {copias[0] ? `${isoAFecha(copias[0].cuando.slice(0, 10))} ${copias[0].cuando.slice(11)}` : "nunca"}</p>
            </div>
          )}
          {seccion === "usuarios" && <Usuarios usuarios={usuarios} setUsuarios={setUsuarios} notificar={notificar} />}
          {seccion === "fichas" && <Fichas fichas={fichas} setFichas={setFichas} notificar={notificar} />}
          {seccion === "asistencias" && <Asistencias fichas={fichas} asistencias={asistencias} setAsistencias={setAsistencias} correcciones={correcciones} setCorrecciones={setCorrecciones} gerente={cuenta.nombre} notificar={notificar} />}
          {seccion === "copias" && <Copias copias={copias} setCopias={setCopias} notificar={notificar} />}
        </main>
      </div>
    </div>
  );
}

function ItemMenu({ activo, onClick, icono, children }: { activo: boolean; onClick: () => void; icono: ReactNode; children: ReactNode }) {
  return (
    <Boton variante="fantasma" onClick={onClick} aria-current={activo ? "page" : undefined}
      className={cn("flex h-auto min-h-12 w-full justify-start whitespace-normal items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] font-bold transition", activo ? "border-primary bg-accent text-primary" : "hover:bg-accent")}>
      <span className="shrink-0">{icono}</span>{children}
    </Boton>
  );
}
