import type { SVGProps } from "react";

/**
 * Set de íconos GESPA: grilla 24x24, trazo 2px, puntas y uniones redondeadas.
 * Redibujado a partir de los íconos de referencia. Sin papelera: las cuentas
 * nunca se eliminan, solo se suspenden.
 */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Registrar entrada / iniciar sesión: flecha hacia la puerta */
export const IconEntrada = (p: P) => (
  <Base {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M3 12h11" />
    <path d="m10 8 4 4-4 4" />
  </Base>
);

/** Registrar salida / cerrar sesión: flecha saliendo de la puerta */
export const IconSalida = (p: P) => (
  <Base {...p}>
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <path d="M10 12h11" />
    <path d="m17 8 4 4-4 4" />
  </Base>
);

/** Historial: reloj con flecha */
export const IconHistorial = (p: P) => (
  <Base {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3 3v4h4" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

/** Modificar: lápiz */
export const IconModificar = (p: P) => (
  <Base {...p}>
    <path d="M15.5 4.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    <path d="m13.5 6.5 3 3" />
  </Base>
);

/** Suspender: pausa dentro de un círculo */
export const IconSuspender = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10 9v6M14 9v6" />
  </Base>
);

/** Perfil / usuario */
export const IconPerfil = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </Base>
);

/** Fichas de personal: persona con carpeta */
export const IconFicha = (p: P) => (
  <Base {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <circle cx="12" cy="12" r="2" />
    <path d="M8.5 17.5a3.5 3.5 0 0 1 7 0" />
  </Base>
);

/** Crear cuenta / registrar usuario */
export const IconCrearCuenta = (p: P) => (
  <Base {...p}>
    <circle cx="10" cy="8" r="4" />
    <path d="M3 20a7 7 0 0 1 11-5.7" />
    <path d="M18 14v6M15 17h6" />
  </Base>
);

export const IconCheck = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Base>
);

export const IconAlerta = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5" />
    <path d="M12 16h.01" />
  </Base>
);

export const IconCandado = (p: P) => (
  <Base {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Base>
);

export const IconCerrar = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const IconNota = (p: P) => (
  <Base {...p}>
    <path d="M5 4h14v16H5z" />
    <path d="M9 9h6M9 13h6M9 17h3" />
  </Base>
);

export const IconCalendario = (p: P) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="m9 15 2 2 4-4" />
  </Base>
);

export const IconCopia = (p: P) => (
  <Base {...p}>
    <ellipse cx="12" cy="6" rx="7.5" ry="3" />
    <path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
    <path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
  </Base>
);

export const IconRestaurar = (p: P) => (
  <Base {...p}>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
    <path d="M21 3v4h-4" />
    <path d="M12 8v5M9.5 10.5 12 13l2.5-2.5" />
  </Base>
);

export const IconBuscar = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </Base>
);

export const IconMas = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconInicio = (p: P) => (
  <Base {...p}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 9.5V20h12V9.5" />
  </Base>
);

export const IconConsultar = (p: P) => (
  <Base {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const IconOjo = (p: P) => <Base {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></Base>;
export const IconOjoOculto = (p: P) => <Base {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /><path d="m3 3 18 18" /></Base>;
