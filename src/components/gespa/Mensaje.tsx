import { IconAlerta, IconCandado, IconCerrar, IconCheck } from "./icons";
import { cn } from "@/lib/utils";

type Props = {
  tipo: "exito" | "error" | "suspendida";
  titulo: string;
  detalle?: string | undefined;
  onCerrar?: () => void;
};

/** Banner persistente hasta cerrarse. Ícono + título + detalle: nunca solo color. */
export function Mensaje({ tipo, titulo, detalle, onCerrar }: Props) {
  const Icono = tipo === "exito" ? IconCheck : tipo === "suspendida" ? IconCandado : IconAlerta;
  return (
    <div
      role={tipo === "exito" ? "status" : "alert"}
      className={cn(
        "flex items-start gap-3 rounded-lg border-2 px-4 py-3",
        tipo === "exito"
          ? "border-success bg-success-soft text-success"
          : "border-destructive bg-destructive-soft text-destructive",
      )}
    >
      <Icono size={24} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-base font-bold">{titulo}</p>
        {detalle && <p className="mt-0.5 text-[15px] text-foreground">{detalle}</p>}
      </div>
      {onCerrar && (
        <button
          onClick={onCerrar}
          aria-label="Cerrar mensaje"
          className="rounded-md p-1.5 text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        >
          <IconCerrar size={20} />
        </button>
      )}
    </div>
  );
}
