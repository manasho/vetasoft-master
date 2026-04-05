/**
 * roleConfig.js
 *
 * Fuente de verdad central para el control de acceso basado en roles (RBAC).
 *
 * Basado en la tabla roles_modulos del schema:
 *   rol_id 1 → Admin fundacion  → acceso total
 *   rol_id 2 → Administrador    → acceso total
 *   rol_id 3 → Cliente          → módulos limitados + datos propios (cliente_id)
 *   rol_id 4 → Director medico  → módulos de gestión clínica + reportes
 *   rol_id 5 → Medico tratante  → módulos médicos + datos propios (veterinario_id)
 *   rol_id 6 → Auxiliar vet.    → módulos básicos de atención
 */

/** Módulos que tiene cada rol (del INSERT INTO roles_modulos del schema) */
const MODULOS_POR_ROL = {
  1: ["dashboard", "clientes", "pets", "appointments", "veterinarios", "medical", "vacunacion", "campanas", "Donaciones", "adoptions", "usuarios", "reportes"],
  2: ["dashboard", "clientes", "pets", "appointments", "veterinarios", "medical", "vacunacion", "campanas", "Donaciones", "adoptions", "usuarios", "reportes"],
  3: ["dashboard", "pets", "appointments", "medical", "vacunacion", "Donaciones", "adoptions"],
  4: ["dashboard", "clientes", "pets", "appointments", "veterinarios", "medical", "vacunacion", "campanas", "reportes"],
  5: ["dashboard", "clientes", "pets", "appointments", "medical", "vacunacion"],
  6: ["dashboard", "clientes", "pets", "appointments"],
};

/**
 * Devuelve la configuración de filtros y permisos para el usuario actual.
 *
 * @param {object} currentUser  – { id, roleId, clienteId, veterinarioId, email, name }
 * @returns {object} config con:
 *   - roleId        : number
 *   - isCliente     : boolean
 *   - isMedico      : boolean  (médico tratante)
 *   - isAdmin       : boolean  (admin fundacion | administrador)
 *   - canEdit       : boolean  (puede crear/editar registros)
 *   - canDelete     : boolean  (puede eliminar registros)
 *   - filtros       : object   (params a pasar a cada endpoint)
 *     - clienteId       : number|null
 *     - veterinarioId   : number|null
 *   - modulosPermitidos : string[]
 */
export function getRoleConfig(currentUser) {
  const roleId = currentUser?.roleId ?? 0;

  // Solo rol 1 y 2 son administradores con acceso completo a los datos
  const isAdmin     = roleId === 1 || roleId === 2;
  const isCliente   = roleId === 3;
  const isDirector  = roleId === 4;
  const isMedico    = roleId === 5;
  const isAuxiliar  = roleId === 6;

  // Personal incluye director, médico tratante y auxiliar (todos tienen veterinario_id)
  const isPersonalMedico = isDirector || isMedico || isAuxiliar;

  return {
    roleId,
    isAdmin,
    isCliente,
    isPersonalMedico,

    // ¿Puede crear/editar? Clientes no (solo se postulan o donan)
    canEdit:   !isCliente,
    
    // ¿Puede eliminar? Solo administradores
    canDelete: isAdmin,

    // Filtros estrictos: Solo isAdmin ve todo. Todos los demás filtran por su ID.
    filtros: {
      clienteId:      isCliente        ? (currentUser?.clienteId ?? null) : null,
      veterinarioId:  isPersonalMedico ? (currentUser?.veterinarioId ?? null) : null,
    },

    modulosPermitidos: MODULOS_POR_ROL[roleId] ?? [],
  };
}

/**
 * Helper rápido: construye los query params para un endpoint
 * según el rol del usuario.
 */
export function buildParams(roleConfig, recurso, extraParams = {}) {
  const base = {};

  // Si es administrador, no aplicamos ningún filtro base, ve todo.
  if (roleConfig.isAdmin) {
    return { ...base, ...extraParams };
  }

  // Si no es administrador, aplicamos filtros estrictos por sus IDs
  switch (recurso) {
    case "animales":
      // El cliente solo ve sus animales. El personal los ve todos (siempre y cuando tengan acceso al módulo)
      // porque los animales no tienen veterinario_id asociado en la tabla directamente.
      if (roleConfig.filtros.clienteId) {
        base.cliente_id = roleConfig.filtros.clienteId;
      }
      break;

    case "historial-medico":
    case "historial-vacunacion":
    case "citas":
      if (roleConfig.filtros.clienteId) {
        base.cliente_id = roleConfig.filtros.clienteId;
      }
      // Si es personal médico/auxiliar, solo ve las citas/historial que él mismo atendió
      if (roleConfig.filtros.veterinarioId) {
        base.veterinario_id = roleConfig.filtros.veterinarioId;
      }
      break;

    case "donaciones":
      if (roleConfig.isCliente && roleConfig.filtros.clienteId === null) {
        // Fallback para filtro si se maneja en el componente (ej. por correo)
      }
      break;

    default:
      break;
  }

  return { ...base, ...extraParams };
}
