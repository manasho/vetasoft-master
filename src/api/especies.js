import api from "./axios";

/**
 * GET /api/especies
 */
export const getEspecies = async (params = {}) => {
  try {
    const res = await api.get("/especies", { params });
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al obtener especies",
    };
  }
};

/**
 * GET /api/especies/:id
 */
export const getEspecieById = async (id) => {
  try {
    const res = await api.get(`/especies/${id}`);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al obtener especie",
    };
  }
};
