import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Login } from "@/components/gespa/Login";
import { InicioPersonal } from "@/components/gespa/InicioPersonal";
import { PanelGerente } from "@/components/gespa/gerente/PanelGerente";
import { ASISTENCIAS, FICHAS, USUARIOS, type Cuenta } from "@/components/gespa/data";

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

export function Index() {
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [usuarios, setUsuarios] = useState(USUARIOS);
  const [fichas, setFichas] = useState(FICHAS);
  const [asistencias, setAsistencias] = useState(ASISTENCIAS);
  return (
    <div className="min-w-[1280px]">
      {cuenta?.rol === "Gerente" ? <PanelGerente key={cuenta.dni} cuenta={cuenta} onSalir={() => setCuenta(null)} usuarios={usuarios} setUsuarios={setUsuarios} fichas={fichas} setFichas={setFichas} asistencias={asistencias} setAsistencias={setAsistencias} /> : cuenta ? <InicioPersonal key={cuenta.dni} cuenta={cuenta} fichas={fichas} asistencias={asistencias} onRegistrar={(r) => setAsistencias((prev) => [...prev, r])} onSalir={() => setCuenta(null)} /> : <Login onIngresar={setCuenta} usuarios={usuarios} fichas={fichas} />}
    </div>
  );
}

