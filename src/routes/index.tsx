import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Login } from "@/components/gespa/Login";
import { InicioPersonal } from "@/components/gespa/InicioPersonal";
import { PanelGerente } from "@/components/gespa/gerente/PanelGerente";
import type { Cuenta } from "@/components/gespa/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GESPA · Inicio de sesión, Personal y Gerente" },
      { name: "description", content: "Prototipo de GESPA: registro de entradas y salidas del personal de Punto de la Suerte." },
      { property: "og:title", content: "GESPA · Punto de la Suerte" },
      { property: "og:description", content: "Prototipo de inicio de sesión y pantalla principal del Personal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  return (
    <div className="min-w-[1366px]">
      {cuenta?.rol === "Gerente" ? <PanelGerente key={cuenta.dni} cuenta={cuenta} onSalir={() => setCuenta(null)} /> : cuenta ? <InicioPersonal key={cuenta.dni} cuenta={cuenta} onSalir={() => setCuenta(null)} /> : <Login onIngresar={setCuenta} />}
      <GuiaPrototipo />
    </div>
  );
}

/** Ayuda solo para revisar el prototipo: cuentas de prueba para ver cada estado. */
function GuiaPrototipo() {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="fixed bottom-4 left-4 z-50 text-sm">
      {abierta && (
        <div className="mb-2 w-80 rounded-lg border-2 bg-card p-4 shadow-xl">
          <p className="font-bold">Personal (contraseña: Suerte2026!)</p>
          <ul className="mt-2 space-y-1.5">
            <li><b className="font-mono">30111222</b> · con último registro</li>
            <li><b className="font-mono">35444555</b> · sin registros (estado vacío)</li>
            <li><b className="font-mono">28999000</b> · cuenta suspendida</li>
          </ul>
          <p className="mt-3 font-bold">Gerente (contraseña: Gerente2026!)</p>
          <ul className="mt-1"><li><b className="font-mono">22333444</b> · Roberto Sosa</li></ul>
          <p className="mt-2 text-muted-foreground">En Copias: la copia del 12/10 simula un error al restaurar.</p>
          <p className="mt-2 text-muted-foreground">Otra contraseña muestra el error. Registrar dos veces lo mismo muestra el error de secuencia.</p>
        </div>
      )}
      <button onClick={() => setAbierta(!abierta)} className="rounded-full border-2 bg-card px-4 py-2 font-bold shadow">
        {abierta ? "Ocultar guía" : "Guía del prototipo"}
      </button>
    </div>
  );
}
