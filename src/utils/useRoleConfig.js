/**
 * useRoleConfig.js
 *
 * Hook que expone la configuración de rol del usuario actual.
 * Usa getRoleConfig() como fuente de verdad central.
 *
 * Retorna el mismo objeto que getRoleConfig() para facilitar
 * el acceso en cualquier componente.
 */
import { useMemo } from "react";
import { getRoleConfig } from "./roleConfig";

export function useRoleConfig(currentUser) {
  return useMemo(() => getRoleConfig(currentUser), [currentUser]);
}

// Re-exporta buildParams para import cómodo
export { buildParams } from "./roleConfig";
