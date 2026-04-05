/**
 * useClienteId — alias de compatibilidad para useRoleConfig.
 *
 * Los componentes que ya usan este hook no necesitan ser modificados.
 * Internamente usa getRoleConfig() como fuente de verdad.
 */
import { useMemo } from "react";
import { getRoleConfig } from "./roleConfig";

export function useClienteId(currentUser) {
  return useMemo(() => {
    const rc = getRoleConfig(currentUser);
    return {
      clienteId:  rc.filtros.clienteId,
      isCliente:  rc.isCliente,
      resolving:  false,   // sin llamada async
    };
  }, [currentUser]);
}
