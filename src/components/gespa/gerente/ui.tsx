import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconBuscar, IconCerrar } from "../icons";

type BtnVar = "primario" | "secundario" | "peligro" | "fantasma";
export function Boton({
  variante = "secundario", icono, children, className, cargando, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: BtnVar; icono?: ReactNode | undefined; cargando?: boolean | undefined }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || cargando}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 px-5 text-base font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40",
        variante === "primario" && "border-primary bg-primary text-primary-foreground hover:opacity-90",
        variante === "secundario" && "border-input bg-card hover:border-primary hover:bg-accent",
        variante === "peligro" && "border-destructive bg-card text-destructive hover:bg-destructive-soft",
        variante === "fantasma" && "border-transparent hover:bg-accent",
        className,
      )}
    >
      {cargando ? <Spinner /> : icono}
      {children}
    </button>
  );
}

export const Spinner = () => (
  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
);

export function Etiqueta({ tono, children, icono }: { tono: "neutro" | "activo" | "suspendido" | "aviso"; children: ReactNode; icono?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-sm font-bold",
        tono === "neutro" && "border-border bg-secondary text-secondary-foreground",
        tono === "activo" && "border-success/30 bg-success-soft text-success",
        tono === "suspendido" && "border-destructive/40 bg-destructive-soft text-destructive",
        tono === "aviso" && "border-warning/50 bg-warning-soft text-warning",
      )}
    >
      {icono}
      {children}
    </span>
  );
}

export function Buscador({ valor, onCambio, placeholder }: { valor: string; onCambio: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block flex-1">
      <span className="sr-only">Buscar</span>
      <IconBuscar size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border-2 border-input bg-card pl-11 pr-4 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
      />
    </label>
  );
}

export function Select({ id, valor, onCambio, opciones, ancho }: { id?: string; valor: string; onCambio: (v: string) => void; opciones: { v: string; t: string }[]; ancho?: string }) {
  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => onCambio(e.target.value)}
      className={cn("h-12 rounded-lg border-2 border-input bg-card px-3 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/20", ancho)}
    >
      {opciones.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
    </select>
  );
}

export function Campo({ id, label, error, ayuda, requerido, children }: { id: string; label: string; error?: string | undefined; ayuda?: string | undefined; requerido?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[15px] font-bold">
        {label} {requerido ? <span className="font-normal text-muted-foreground">(obligatorio)</span> : null}
      </label>
      {children}
      {(error || ayuda) && (
        <p id={`${id}-msg`} className={cn("text-sm", error ? "font-bold text-destructive" : "text-muted-foreground")}>
          {error ? `⚠ ${error}` : ayuda}
        </p>
      )}
    </div>
  );
}

export const inputG = (err?: string | boolean) =>
  cn(
    "h-12 w-full rounded-lg border-2 bg-card px-3.5 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:bg-muted disabled:text-muted-foreground",
    err ? "border-destructive" : "border-input",
  );

/** Pie común de formularios y diálogos: Cancelar a la izquierda, Confirmar a la derecha, siempre igual. */
export function PieAcciones({ onCancelar, onConfirmar, textoConfirmar = "Confirmar", peligro, cargando, deshabilitado }: {
  onCancelar: () => void; onConfirmar: () => void; textoConfirmar?: string; peligro?: boolean; cargando?: boolean; deshabilitado?: boolean;
}) {
  return (
    <div className="flex justify-end gap-3 border-t pt-4">
      <Boton variante="secundario" onClick={onCancelar} disabled={cargando}>Cancelar</Boton>
      <Boton variante={peligro ? "peligro" : "primario"} onClick={onConfirmar} cargando={cargando} disabled={deshabilitado} className={peligro ? "border-destructive" : ""}>
        {cargando ? "Procesando…" : textoConfirmar}
      </Boton>
    </div>
  );
}

export function Dialogo({ abierto, titulo, icono, onCerrar, children, ancho = "max-w-lg" }: { abierto: boolean; titulo: string; icono?: ReactNode; onCerrar: () => void; children: ReactNode; ancho?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    ref.current?.querySelector<HTMLElement>("input,select,textarea,button")?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [abierto, onCerrar]);
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/40 p-6" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={titulo} className={cn("w-full rounded-xl border-2 bg-card p-6 shadow-2xl", ancho)}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="flex items-center gap-2.5 text-xl font-bold">{icono}{titulo}</h2>
          <button onClick={onCerrar} aria-label="Cerrar" className="rounded-md p-1.5 hover:bg-accent"><IconCerrar size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Vacio({ icono, titulo, detalle, accion }: { icono: ReactNode; titulo: string; detalle?: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center">
      <span className="text-muted-foreground">{icono}</span>
      <p className="text-lg font-bold">{titulo}</p>
      {detalle && <p className="max-w-md text-[15px] text-muted-foreground">{detalle}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}

export function Encabezado({ icono, titulo, descripcion, acciones }: { icono: ReactNode; titulo: string; descripcion?: string; acciones?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-primary">{icono}{titulo}</h1>
        {descripcion && <p className="mt-1 text-[15px] text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones}
    </div>
  );
}

export function Aviso({ icono, children, tono = "neutro" }: { icono: ReactNode; children: ReactNode; tono?: "neutro" | "aviso" }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border-2 px-3.5 py-3 text-[15px]", tono === "aviso" ? "border-warning/50 bg-warning-soft" : "border-border bg-muted")}>
      <span className={cn("mt-0.5 shrink-0", tono === "aviso" ? "text-warning" : "text-muted-foreground")}>{icono}</span>
      <div>{children}</div>
    </div>
  );
}

export const thCls = "sticky top-0 bg-muted px-3 py-3 text-left text-sm font-bold uppercase tracking-wide text-muted-foreground";
export const tdCls = "px-3 py-2.5 text-[15px]";
