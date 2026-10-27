import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { IconOjo } from "./icons";
import { Boton } from "./gerente/ui";

export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const label = visible ? "Ocultar contraseña" : "Mostrar contraseña";
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={cn(className, "pr-14")} />
      <Boton type="button" variante="fantasma" disabled={props.disabled} aria-label={label} aria-controls={props.id} aria-pressed={visible} title={label}
        onClick={() => setVisible((v) => !v)} className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 px-0 text-primary">
        <IconOjo size={22} />
        {visible && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute"><path d="m3 3 18 18" /></svg>}
      </Boton>
    </div>
  );
}