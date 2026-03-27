import axios from "axios";

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || "http://localhost:4000") + "/api", // Backend Express
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor para enviar el JWT automáticamente
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // donde guardaremos el JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de respuestas (opcional pero recomendado)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token inválido o expirado");
      // aquí luego puedes redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
