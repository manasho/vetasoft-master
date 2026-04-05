import api from "./axios";

/**
 * GET /api/notificaciones
 * Retorna las notificaciones del usuario autenticado.
 * @param {boolean} soloNoLeidas - Si true, filtra solo no leídas
 */
export const getNotificaciones = async (soloNoLeidas = false) => {
  try {
    const res = await api.get("/notificaciones", {
      params: soloNoLeidas ? { soloNoLeidas: "true" } : {},
    });
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al obtener notificaciones",
    };
  }
};

/**
 * GET /api/notificaciones/contador
 * Retorna { count: N } — badge de la campana
 */
export const getContador = async () => {
  try {
    const res = await api.get("/notificaciones/contador");
    return res.data;
  } catch (err) {
    return { success: false, data: { count: 0 } };
  }
};

/**
 * PATCH /api/notificaciones/leer-todas
 * Marca todas las notificaciones como leídas
 */
export const marcarTodasLeidas = async () => {
  try {
    const res = await api.patch("/notificaciones/leer-todas");
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al marcar notificaciones",
    };
  }
};

/**
 * PATCH /api/notificaciones/:id/leer
 * Marca una notificación específica como leída
 */
export const marcarLeida = async (id) => {
  try {
    const res = await api.patch(`/notificaciones/${id}/leer`);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al marcar notificación",
    };
  }
};

/**
 * DELETE /api/notificaciones/:id
 * Elimina una notificación
 */
export const eliminarNotificacion = async (id) => {
  try {
    const res = await api.delete(`/notificaciones/${id}`);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al eliminar notificación",
    };
  }
};
