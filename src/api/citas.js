import api from "./axios";

/**
 * GET /api/citas
 */
export const getCitas = async (params = {}) => {
  try {
    const res = await api.get("/citas", { params });
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al obtener citas",
    };
  }
};

/**
 * GET /api/citas/:id
 */
export const getCitaById = async (id) => {
  try {
    const res = await api.get(`/citas/${id}`);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al obtener cita",
    };
  }
};

/**
 * POST /api/citas
 */
export const createCita = async (data) => {
  try {
    const res = await api.post("/citas", data);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al crear cita",
    };
  }
};

/**
 * PUT /api/citas/:id
 */
export const updateCita = async (id, data) => {
  try {
    const res = await api.put(`/citas/${id}`, data);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al actualizar cita",
    };
  }
};

/**
 * DELETE /api/citas/:id
 */
export const deleteCita = async (id) => {
  try {
    const res = await api.delete(`/citas/${id}`);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al eliminar cita",
    };
  }
};
