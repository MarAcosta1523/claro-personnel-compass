/** Deterministic transient failures for UI review; subsequent attempts succeed. */
export function createAttemptTracker() {
  const intentos = new Set<string>();
  return (accion: string) => {
    if (intentos.has(accion)) return false;
    intentos.add(accion);
    return true;
  };
}