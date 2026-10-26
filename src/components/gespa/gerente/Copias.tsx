import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ahoraIso, isoAFecha, type Copia } from "../data";
import { IconAlerta, IconCheck, IconCopia, IconRestaurar } from "../icons";
import { Aviso, Boton, Dialogo, Encabezado, PieAcciones, Vacio, tdCls, thCls } from "./ui";
import type { Notificar } from "./PanelGerente";
import { createAttemptTracker } from "../prototype";

const fmt = (c: string) => `${isoAFecha(c.slice(0, 10))} ${c.slice(11)}`;

export function Copias({ copias, setCopias, notificar }: { copias: Copia[]; setCopias: (c: Copia[]) => void; notificar: Notificar }) {
  const [generando, setGenerando] = useState(false);
  const [fallar] = useState(createAttemptTracker);
  const [archivo, setArchivo] = useState<{ nombre: string; legible: boolean } | null>(null);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const generar = () => {
    setGenerando(true);
    setTimeout(() => {
      setGenerando(false);
      if (fallar("generar")) { notificar("error", "No se pudo generar la copia de seguridad", "Intentá de nuevo."); return; }
      const cuando = ahoraIso();
      const c: Copia = { id: Date.now(), cuando, archivo: `gespa_${cuando.replace(" ", "_").replace(":", "")}.bak`, tamano: "1,2 MB" };
      setCopias([c, ...copias]);
      notificar("exito", "La copia de seguridad fue generada", `Se guardó «${c.archivo}» el ${fmt(cuando)}.`);
    }, 1000);
  };

  const elegir = (nombre: string) => {
    // Simulación: solo los .bak se consideran legibles.
    const legible = nombre.toLowerCase().endsWith(".bak") && !nombre.toLowerCase().includes("danad");
    setArchivo({ nombre, legible });
    setErrorArchivo(legible ? "" : "No se pudo abrir la copia. Elegí otro archivo.");
  };

  const restaurar = () => {
    setRestaurando(true);
    setTimeout(() => {
      setRestaurando(false);
      setConfirmar(false);
      if (archivo?.nombre.includes("2026-10-12")) {
        notificar("error", "No se pudo restaurar la copia", "Probá con otra copia.");
      } else {
        notificar("exito", "La copia fue restaurada", `Se restauró «${archivo?.nombre}».`);
      }
      setArchivo(null);
    }, 1400);
  };

  return (
    <>
      <Encabezado icono={<IconCopia size={28} />} titulo="Copias de seguridad" />
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6">
        <section className="min-w-0 space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold"><IconCopia size={22} />Generar copia</h2>
            
          </div>
          <Boton variante="primario" icono={<IconCopia size={22} />} onClick={generar} cargando={generando} className="w-full">{generando ? "Generando copia…" : "Generar copia de seguridad"}</Boton>
          <h3 className="pt-2 text-base font-bold">Copias generadas</h3>
          {copias.length === 0 ? (
            <Vacio icono={<IconCopia size={36} />} titulo="Todavía no hay copias"  />
          ) : (
            <div className="max-h-72 overflow-auto rounded-lg border-2">
              <table className="w-full">
                <thead><tr><th className={thCls}>Fecha y hora</th><th className={thCls}>Archivo</th><th className={thCls}>Tamaño</th><th className={thCls}></th></tr></thead>
                <tbody>
                  {copias.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className={cn(tdCls, "font-mono font-bold")}>{fmt(c.cuando)}</td>
                      <td className={cn(tdCls, "font-mono text-sm")}>{c.archivo}</td>
                      <td className={tdCls}>{c.tamano}</td>
                      <td className={tdCls}><Boton variante="fantasma" onClick={() => elegir(c.archivo)} className="h-auto px-1 text-sm" title="Usar para restaurar" aria-label={`Usar ${c.archivo} para restaurar`}><IconRestaurar size={20} /></Boton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="min-w-0 space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold"><IconRestaurar size={22} />Restaurar desde una copia</h2>
            
          </div>
          <ol className="space-y-4">
            <li className="space-y-2">
              <p className="font-bold">Archivo de copia</p>
              <input ref={input} type="file" accept=".bak" className="hidden" onChange={(e) => e.target.files?.[0] && elegir(e.target.files[0].name)} />
              <Boton onClick={() => input.current?.click()} className="w-full">Buscar archivo en esta PC…</Boton>
              {archivo && (
                <div className={cn("flex items-start gap-2 rounded-lg border-2 px-3 py-2 text-[15px]", archivo.legible ? "border-success/40 bg-success-soft" : "border-destructive bg-destructive-soft")}>
                  {archivo.legible ? <IconCheck size={20} className="shrink-0 text-success" /> : <IconAlerta size={20} className="shrink-0 text-destructive" />}
                  <div>
                    <p className="break-all font-mono font-bold">{archivo.nombre}</p>
                    {!archivo.legible && <p role="alert" className="font-bold text-destructive">{errorArchivo}</p>}
                  </div>
                </div>
              )}
            </li>
            <li className="space-y-2">
              <p className="font-bold">Restaurar</p>
              <Boton variante="peligro" icono={<IconRestaurar size={22} />} disabled={!archivo?.legible} onClick={() => setConfirmar(true)} className="w-full">Restaurar copia</Boton>
              
            </li>
          </ol>
          
        </section>
      </div>

      <Dialogo abierto={confirmar} titulo="¿Restaurar esta copia?" icono={<IconRestaurar size={24} className="text-destructive" />} onCerrar={() => !restaurando && setConfirmar(false)}>
        <div className="space-y-4">
          <p className="text-base">Vas a restaurar <b className="font-mono">{archivo?.nombre}</b>.</p>
          <p className="text-[15px]">¿Querés reemplazar los datos actuales por esta copia?</p>
          <PieAcciones onCancelar={() => setConfirmar(false)} onConfirmar={restaurar} textoConfirmar="Sí, restaurar" peligro cargando={restaurando} />
        </div>
      </Dialogo>
    </>
  );
}
