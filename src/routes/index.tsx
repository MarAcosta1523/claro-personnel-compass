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
      { name: "description", content: "Punto de la Suerte: asistencia del personal y gestión del Gerente." },
      { property: "og:title", content: "GESPA · Punto de la Suerte" },
      { property: "og:description", content: "Acceso a GESPA, registro de asistencia y gestión de Punto de la Suerte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  return (
    <div className="min-w-[1280px]">
      {cuenta?.rol === "Gerente" ? <PanelGerente key={cuenta.dni} cuenta={cuenta} onSalir={() => setCuenta(null)} /> : cuenta ? <InicioPersonal key={cuenta.dni} cuenta={cuenta} onSalir={() => setCuenta(null)} /> : <Login onIngresar={setCuenta} />}
    </div>
  );
}

