import api from "./axios"

export const getAnimales = async (params = {}) => {
  try {
    const res = await api.get("/animales", { params });
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al obtener animales",
    };
  }
};

/**
 * GET /api/animales/:id
 */
export const getAnimalById = async (id) => {
  try {
    const res = await api.get(`/animales/${id}`);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al obtener animal",
    };
  }
};

/**
 * POST /api/animales
 */
export const createAnimal = async (data) => {
  try {
    const res = await api.post("/animales", data);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al crear animal",
    };
  }
};

/**
 * PUT /api/animales/:id
 */
export const updateAnimal = async (id, data) => {
  try {
    const res = await api.put(`/animales/${id}`, data);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al actualizar animal",
    };
  }
};

/**
 * DELETE /api/animales/:id
 */
export const deleteAnimal = async (id) => {
  try {
    const res = await api.delete(`/animales/${id}`);
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al eliminar animal",
    };
  }
};